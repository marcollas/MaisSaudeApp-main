import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkouts } from '../../contexts/WorkoutsContext';
import { formatDuration, formatDistance, formatPace } from '../../models/workoutModels';

function getWorkoutIcon(type) {
  const icons = {
    run: { name: 'run', color: '#FF7043' },
    walk: { name: 'walk', color: '#29B6F6' },
    strength: { name: 'dumbbell', color: '#66BB6A' },
    other: { name: 'clock-outline', color: '#9E9E9E' },
  };
  return icons[type] || icons.other;
}

function formatFullDate(isoString) {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

export default function WorkoutDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutId } = route.params || {};
  const { workouts, removeWorkout, updateWorkout } = useWorkouts();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <VectorIcons.Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.emptyText}>Treino não encontrado</Text>
      </View>
    );
  }

  const iconData = getWorkoutIcon(workout.type);

  const handleDelete = () => {
    Alert.alert(
      'Excluir treino',
      'Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWorkout(workout.id);
              Alert.alert('Sucesso', 'Treino excluído com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o treino.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleEditNotes = () => {
    setEditedNotes(workout.notes || '');
    setShowEditModal(true);
  };

  const handleSaveNotes = async () => {
    try {
      await updateWorkout(workout.id, { notes: editedNotes.trim() });
      setShowEditModal(false);
      Alert.alert('Sucesso', 'Observação atualizada com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a observação.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <VectorIcons.Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Treino</Text>
        <TouchableOpacity onPress={handleDelete}>
          <VectorIcons.MaterialCommunityIcons 
            name="delete-outline" 
            size={28} 
            color="#F44336" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card principal */}
        <View style={styles.mainCard}>
          <View style={[styles.iconCircle, { backgroundColor: iconData.color }]}>
            <VectorIcons.MaterialCommunityIcons 
              name={iconData.name} 
              size={48} 
              color="white" 
            />
          </View>
          <Text style={styles.title}>{workout.title}</Text>
          <Text style={styles.date}>{formatFullDate(workout.endedAt || workout.startedAt)}</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <VectorIcons.MaterialCommunityIcons 
              name="clock-outline" 
              size={24} 
              color={COLORS.primary} 
            />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Duração</Text>
              <Text style={styles.statValue}>{formatDuration(workout.durationSec)}</Text>
            </View>
          </View>

          {workout.distanceM > 0 && (
            <View style={styles.statRow}>
              <VectorIcons.MaterialCommunityIcons 
                name="map-marker-distance" 
                size={24} 
                color={COLORS.primary} 
              />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{formatDistance(workout.distanceM)}</Text>
              </View>
            </View>
          )}

          {workout.avgPaceSecPerKm && (
            <View style={styles.statRow}>
              <VectorIcons.MaterialCommunityIcons 
                name="speedometer" 
                size={24} 
                color={COLORS.primary} 
              />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Ritmo médio</Text>
                <Text style={styles.statValue}>{formatPace(workout.avgPaceSecPerKm)}</Text>
              </View>
            </View>
          )}

          {workout.caloriesEst > 0 && (
            <View style={styles.statRow}>
              <VectorIcons.MaterialCommunityIcons 
                name="fire" 
                size={24} 
                color={COLORS.primary} 
              />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Calorias estimadas</Text>
                <Text style={styles.statValue}>{workout.caloriesEst} kcal</Text>
              </View>
            </View>
          )}
        </View>

        {/* Treino de força - séries */}
        {workout.type === 'strength' && workout.strength && (
          <View style={styles.strengthCard}>
            <Text style={styles.sectionTitle}>Exercício</Text>
            <Text style={styles.exerciseName}>{workout.strength.exerciseName}</Text>
            
            <Text style={styles.sectionTitle}>Séries ({workout.strength.sets.length})</Text>
            {workout.strength.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <Text style={styles.setInfo}>
                  {set.reps} reps × {set.weight} kg
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Observações */}
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <TouchableOpacity onPress={handleEditNotes}>
              <VectorIcons.MaterialCommunityIcons 
                name="pencil" 
                size={20} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
          {workout.notes ? (
            <Text style={styles.notesText}>{workout.notes}</Text>
          ) : (
            <Text style={styles.notesEmpty}>Nenhuma observação adicionada</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal de editar nota */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar observação</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Como foi o treino?"
              value={editedNotes}
              onChangeText={setEditedNotes}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveNotes}>
              <Text style={styles.modalSaveButtonText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
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
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  statContent: {
    flex: 1,
    marginLeft: 16,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  strengthCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 16,
    width: 24,
  },
  setInfo: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  notesEmpty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 40,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
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
