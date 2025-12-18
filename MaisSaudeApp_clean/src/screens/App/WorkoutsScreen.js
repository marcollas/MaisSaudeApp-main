import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import * as VectorIcons from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWorkouts } from '../../contexts/WorkoutsContext';
import WorkoutStartCard from '../../components/WorkoutStartCard';
import WorkoutListItem from '../../components/WorkoutListItem';
import { formatDuration, formatDistance } from '../../models/workoutModels';
import AnimatedFadeInUp from '../../components/AnimatedFadeInUp';

export default function WorkoutsScreen() {
  const { workouts, isLoading, getWeeklySummary } = useWorkouts();
  const nav = useNavigation();
  const [showMoreModal, setShowMoreModal] = useState(false);

  const weeklySummary = getWeeklySummary();
  const recentWorkouts = workouts.slice(0, 10); // Últimos 10 treinos

  const handleStartWorkout = (type, title) => {
    setShowMoreModal(false);
    if (type === 'strength') {
      nav.navigate('StrengthWorkout');
    } else {
      nav.navigate('WorkoutSession', { type, title });
    }
  };

  const handleWorkoutPress = (workout) => {
    nav.navigate('WorkoutDetails', { workoutId: workout.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Text style={styles.header}>Boa forma</Text>

        {/* Iniciar treino */}
        <Text style={styles.sectionTitle}>Iniciar treino</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.startCardsContainer}
        >
          <WorkoutStartCard
            title="Corrida"
            icon="run"
            color="#FF7043"
            onPress={() => handleStartWorkout('run', 'Corrida')}
          />
          <WorkoutStartCard
            title="Caminhada"
            icon="walk"
            color="#29B6F6"
            onPress={() => handleStartWorkout('walk', 'Caminhada')}
          />
          <WorkoutStartCard
            title="Força"
            icon="dumbbell"
            color="#66BB6A"
            onPress={() => handleStartWorkout('strength', 'Treino de Força')}
          />
          <TouchableOpacity 
            style={styles.moreCard}
            onPress={() => setShowMoreModal(true)}
          >
            <VectorIcons.MaterialCommunityIcons name="plus" size={36} color={COLORS.primary} />
            <Text style={styles.moreText}>Mais</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Resumo da semana */}
        <Text style={styles.sectionTitle}>Resumo da semana</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <VectorIcons.MaterialCommunityIcons 
                name="dumbbell" 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.summaryValue}>{weeklySummary.count}</Text>
              <Text style={styles.summaryLabel}>Treinos</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <VectorIcons.MaterialCommunityIcons 
                name="clock-outline" 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.summaryValue}>
                {formatDuration(weeklySummary.totalDurationSec)}
              </Text>
              <Text style={styles.summaryLabel}>Tempo</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <VectorIcons.MaterialCommunityIcons 
                name="map-marker-distance" 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.summaryValue}>
                {formatDistance(weeklySummary.totalDistanceM)}
              </Text>
              <Text style={styles.summaryLabel}>Distância</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <VectorIcons.MaterialCommunityIcons 
                name="fire" 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.summaryValue}>{weeklySummary.totalCalories}</Text>
              <Text style={styles.summaryLabel}>Calorias</Text>
            </View>
          </View>
        </View>

        {/* Atividades recentes */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Atividades recentes</Text>
        </View>
        
        {isLoading ? (
          <Text style={styles.emptyText}>Carregando...</Text>
        ) : recentWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <VectorIcons.MaterialCommunityIcons 
              name="dumbbell" 
              size={64} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
            <Text style={styles.emptySubtitle}>
              Comece seu primeiro treino agora!
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => handleStartWorkout('run', 'Corrida')}
            >
              <Text style={styles.emptyButtonText}>Iniciar treino</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentWorkouts.map((workout, index) => (
            <AnimatedFadeInUp key={workout.id} delay={Math.min(index, 8) * 60}>
              <WorkoutListItem
                workout={workout}
                onPress={() => handleWorkoutPress(workout)}
              />
            </AnimatedFadeInUp>
          ))
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal "Mais opções" */}
      <Modal
        visible={showMoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mais opções de treino</Text>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleStartWorkout('other', 'Treino Livre')}
            >
              <VectorIcons.MaterialCommunityIcons name="clock-outline" size={28} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>Treino Livre (Cronômetro)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowMoreModal(false)}
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
  content: {
    paddingBottom: 20,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    paddingHorizontal: SIZES.padding, 
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginLeft: SIZES.padding, 
    marginTop: 24, 
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  startCardsContainer: {
    paddingLeft: SIZES.padding,
    paddingRight: SIZES.padding - 12,
  },
  moreCard: {
    width: 160,
    height: 140,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  moreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SIZES.padding,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: SIZES.padding,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 20,
    paddingHorizontal: SIZES.padding,
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
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 16,
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
