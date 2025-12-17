import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkouts } from '../../contexts/WorkoutsContext';
import {
  createWorkoutEntry,
  formatDuration,
  formatDistance,
  formatPace,
  estimateCalories,
  calculatePace,
  haversineDistance,
} from '../../models/workoutModels';

export default function WorkoutSessionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { type = 'run', title = 'Treino' } = route.params || {};
  const { addWorkout } = useWorkouts();

  // Estado do treino
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  
  // Modal de salvar
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Refs
  const timerRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const lastPositionRef = useRef(null);
  const startTimeRef = useRef(null);

  // Solicita permissão de localização ao montar
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            'Permissão de localização',
            'GPS não disponível. O treino será registrado apenas com o tempo.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
      }
    })();

    return () => {
      stopTracking();
    };
  }, []);

  // Inicia o tracking
  const startTracking = async () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - elapsedSec * 1000;

    // Timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSec(elapsed);
    }, 1000);

    // GPS tracking (se tiver permissão e for corrida/caminhada)
    if (hasLocationPermission && (type === 'run' || type === 'walk')) {
      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            
            if (lastPositionRef.current) {
              const dist = haversineDistance(
                lastPositionRef.current.latitude,
                lastPositionRef.current.longitude,
                latitude,
                longitude
              );
              
              // Filtrar movimentos muito pequenos (ruído GPS)
              if (dist > 5 && dist < 100) {
                setDistanceM(prev => prev + dist);
              }
            }
            
            lastPositionRef.current = { latitude, longitude };
          }
        );
      } catch (error) {
        console.error('Erro ao iniciar GPS:', error);
      }
    }
  };

  // Pausa o tracking
  const pauseTracking = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Retoma o tracking
  const resumeTracking = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - elapsedSec * 1000;
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSec(elapsed);
    }, 1000);
  };

  // Para o tracking
  const stopTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  // Finaliza o treino
  const handleFinish = () => {
    if (elapsedSec < 10) {
      Alert.alert('Treino muito curto', 'Continue por mais tempo antes de finalizar.');
      return;
    }
    
    pauseTracking();
    stopTracking();
    setShowSaveModal(true);
  };

  // Salva o treino
  const handleSave = async () => {
    try {
      const workout = createWorkoutEntry(type);
      workout.title = title;
      workout.durationSec = elapsedSec;
      workout.distanceM = Math.round(distanceM);
      workout.endedAt = new Date().toISOString();
      workout.caloriesEst = estimateCalories(type, elapsedSec);
      workout.notes = notes.trim();
      
      if (workout.distanceM > 0) {
        workout.avgPaceSecPerKm = calculatePace(elapsedSec, workout.distanceM);
      }

      await addWorkout(workout);
      
      Alert.alert('Sucesso!', 'Treino salvo com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
      console.error(error);
    }
  };

  // Cancela e volta
  const handleCancel = () => {
    if (isRunning || isPaused || elapsedSec > 0) {
      Alert.alert(
        'Descartar treino?',
        'Seu progresso não será salvo.',
        [
          { text: 'Continuar treino', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => {
              stopTracking();
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const avgPace = distanceM > 0 ? calculatePace(elapsedSec, distanceM) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <VectorIcons.Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Timer principal */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>TEMPO</Text>
        <Text style={styles.timerText}>{formatDuration(elapsedSec)}</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <VectorIcons.MaterialCommunityIcons 
            name="map-marker-distance" 
            size={32} 
            color={COLORS.primary} 
          />
          <Text style={styles.statValue}>
            {hasLocationPermission && (type === 'run' || type === 'walk')
              ? formatDistance(distanceM)
              : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Distância</Text>
        </View>

        <View style={styles.statBox}>
          <VectorIcons.MaterialCommunityIcons 
            name="speedometer" 
            size={32} 
            color={COLORS.primary} 
          />
          <Text style={styles.statValue}>
            {avgPace ? formatPace(avgPace) : '--'}
          </Text>
          <Text style={styles.statLabel}>Ritmo médio</Text>
        </View>

        <View style={styles.statBox}>
          <VectorIcons.MaterialCommunityIcons 
            name="fire" 
            size={32} 
            color={COLORS.primary} 
          />
          <Text style={styles.statValue}>
            {estimateCalories(type, elapsedSec)}
          </Text>
          <Text style={styles.statLabel}>Calorias</Text>
        </View>
      </View>

      {/* Mensagem de GPS */}
      {!hasLocationPermission && (type === 'run' || type === 'walk') && (
        <View style={styles.warningBox}>
          <VectorIcons.MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={20} 
            color="#FF9800" 
          />
          <Text style={styles.warningText}>
            GPS desativado. Apenas o tempo será registrado.
          </Text>
        </View>
      )}

      {/* Botões de controle */}
      <View style={styles.controlsContainer}>
        {!isRunning && elapsedSec === 0 && (
          <TouchableOpacity 
            style={[styles.controlButton, styles.startButton]} 
            onPress={startTracking}
          >
            <VectorIcons.MaterialCommunityIcons name="play" size={48} color="white" />
          </TouchableOpacity>
        )}

        {isRunning && !isPaused && (
          <>
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]} 
              onPress={pauseTracking}
            >
              <VectorIcons.MaterialCommunityIcons name="pause" size={48} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={handleFinish}
            >
              <VectorIcons.MaterialCommunityIcons name="stop" size={48} color="white" />
            </TouchableOpacity>
          </>
        )}

        {isPaused && (
          <>
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]} 
              onPress={resumeTracking}
            >
              <VectorIcons.MaterialCommunityIcons name="play" size={48} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]} 
              onPress={handleFinish}
            >
              <VectorIcons.MaterialCommunityIcons name="stop" size={48} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal de salvar */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Salvar treino</Text>
            
            <View style={styles.modalStats}>
              <Text style={styles.modalStatText}>
                Duração: <Text style={styles.modalStatBold}>{formatDuration(elapsedSec)}</Text>
              </Text>
              {distanceM > 0 && (
                <Text style={styles.modalStatText}>
                  Distância: <Text style={styles.modalStatBold}>{formatDistance(distanceM)}</Text>
                </Text>
              )}
              <Text style={styles.modalStatText}>
                Calorias: <Text style={styles.modalStatBold}>{estimateCalories(type, elapsedSec)} kcal</Text>
              </Text>
            </View>

            <Text style={styles.modalLabel}>Adicionar observação (opcional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Como foi o treino?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
              <Text style={styles.modalSaveButtonText}>Salvar treino</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => {
                setShowSaveModal(false);
                if (isPaused) resumeTracking();
              }}
            >
              <Text style={styles.modalCancelText}>Continuar treino</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    marginHorizontal: SIZES.padding,
    borderRadius: 8,
    marginBottom: 30,
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: SIZES.padding,
    marginTop: 'auto',
    marginBottom: 60,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  modalStats: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStatText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalStatBold: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
