import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useWorkouts } from '../../contexts/WorkoutsContext';
import { createWorkoutEntry, estimateCalories } from '../../models/workoutModels';

// Lista de exercícios comuns
const COMMON_EXERCISES = [
  'Supino',
  'Agachamento',
  'Levantamento Terra',
  'Desenvolvimento',
  'Remada',
  'Rosca Direta',
  'Tríceps Testa',
  'Leg Press',
  'Puxada',
  'Flexão',
];

export default function StrengthWorkoutScreen() {
  const navigation = useNavigation();
  const { addWorkout } = useWorkouts();

  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [restTimerSec, setRestTimerSec] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [startTime] = useState(Date.now());
  
  const restIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  const startRestTimer = (seconds) => {
    setRestTimerSec(seconds);
    setIsResting(true);
    
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    
    restIntervalRef.current = setInterval(() => {
      setRestTimerSec(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addSet = () => {
    const reps = parseInt(currentReps);
    const weight = parseFloat(currentWeight);

    if (!reps || reps <= 0) {
      Alert.alert('Aviso', 'Insira o número de repetições');
      return;
    }

    if (!weight || weight < 0) {
      Alert.alert('Aviso', 'Insira a carga utilizada (ou 0 para peso corporal)');
      return;
    }

    setSets([...sets, { reps, weight }]);
    setCurrentReps('');
    setCurrentWeight('');
  };

  const removeSet = (index) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Aviso', 'Insira o nome do exercício');
      return;
    }

    if (sets.length === 0) {
      Alert.alert('Aviso', 'Adicione pelo menos uma série');
      return;
    }

    try {
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      const workout = createWorkoutEntry('strength');
      workout.title = 'Treino de Força';
      workout.durationSec = durationSec;
      workout.endedAt = new Date().toISOString();
      workout.caloriesEst = estimateCalories('strength', durationSec);
      workout.strength = {
        exerciseName: exerciseName.trim(),
        sets,
      };

      await addWorkout(workout);
      
      Alert.alert('Sucesso!', 'Treino salvo com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (exerciseName || sets.length > 0) {
      Alert.alert(
        'Descartar treino?',
        'Seu progresso não será salvo.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const selectExercise = (name) => {
    setExerciseName(name);
    setShowExerciseList(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <VectorIcons.Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treino de Força</Text>
        <TouchableOpacity onPress={handleSave}>
          <VectorIcons.Ionicons name="checkmark" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Seleção do exercício */}
        <Text style={styles.label}>Exercício</Text>
        <TouchableOpacity 
          style={styles.exerciseInput}
          onPress={() => setShowExerciseList(true)}
        >
          <TextInput
            style={styles.input}
            placeholder="Digite ou selecione o exercício"
            value={exerciseName}
            onChangeText={setExerciseName}
          />
          <VectorIcons.MaterialCommunityIcons 
            name="chevron-down" 
            size={24} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>

        {/* Adicionar série */}
        <Text style={styles.label}>Nova série</Text>
        <View style={styles.setInputContainer}>
          <View style={styles.setInputWrapper}>
            <Text style={styles.setInputLabel}>Repetições</Text>
            <TextInput
              style={styles.setInput}
              placeholder="0"
              keyboardType="numeric"
              value={currentReps}
              onChangeText={setCurrentReps}
            />
          </View>
          <View style={styles.setInputWrapper}>
            <Text style={styles.setInputLabel}>Carga (kg)</Text>
            <TextInput
              style={styles.setInput}
              placeholder="0"
              keyboardType="decimal-pad"
              value={currentWeight}
              onChangeText={setCurrentWeight}
            />
          </View>
          <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
            <VectorIcons.MaterialCommunityIcons name="plus" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Timer de descanso */}
        {isResting && (
          <View style={styles.restTimerContainer}>
            <Text style={styles.restTimerLabel}>DESCANSO</Text>
            <Text style={styles.restTimerText}>{restTimerSec}s</Text>
          </View>
        )}

        {!isResting && sets.length > 0 && (
          <View style={styles.restButtonsContainer}>
            <Text style={styles.restLabel}>Iniciar descanso:</Text>
            <View style={styles.restButtons}>
              <TouchableOpacity 
                style={styles.restButton}
                onPress={() => startRestTimer(30)}
              >
                <Text style={styles.restButtonText}>30s</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.restButton}
                onPress={() => startRestTimer(60)}
              >
                <Text style={styles.restButtonText}>60s</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.restButton}
                onPress={() => startRestTimer(90)}
              >
                <Text style={styles.restButtonText}>90s</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista de séries */}
        <Text style={styles.label}>
          Séries registradas ({sets.length})
        </Text>
        {sets.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma série adicionada ainda</Text>
        ) : (
          <View style={styles.setsList}>
            {sets.map((set, index) => (
              <View key={index} style={styles.setItem}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <Text style={styles.setText}>
                  {set.reps} reps × {set.weight} kg
                </Text>
                <TouchableOpacity onPress={() => removeSet(index)}>
                  <VectorIcons.MaterialCommunityIcons 
                    name="delete-outline" 
                    size={24} 
                    color="#F44336" 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de lista de exercícios */}
      <Modal
        visible={showExerciseList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExerciseList(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExerciseList(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o exercício</Text>
            <ScrollView>
              {COMMON_EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  style={styles.exerciseOption}
                  onPress={() => selectExercise(exercise)}
                >
                  <Text style={styles.exerciseOptionText}>{exercise}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowExerciseList(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  exerciseInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  setInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  setInputWrapper: {
    flex: 1,
  },
  setInputLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  setInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addSetButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimerContainer: {
    backgroundColor: '#FF9800',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  restTimerLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  restTimerText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
  },
  restButtonsContainer: {
    marginTop: 20,
  },
  restLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  restButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  restButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  restButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  setsList: {
    marginTop: 8,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 12,
    width: 30,
  },
  setText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  exerciseOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  exerciseOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  modalCancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
