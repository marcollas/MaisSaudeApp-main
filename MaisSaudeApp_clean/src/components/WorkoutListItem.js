import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { formatDuration, formatDistance, formatPace } from '../models/workoutModels';

/**
 * Retorna ícone e cor para cada tipo de treino
 */
function getWorkoutIcon(type) {
  const icons = {
    run: { name: 'run', color: '#FF7043' },
    walk: { name: 'walk', color: '#29B6F6' },
    strength: { name: 'dumbbell', color: '#66BB6A' },
    other: { name: 'clock-outline', color: '#9E9E9E' },
  };
  return icons[type] || icons.other;
}

/**
 * Formata data para exibição
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  
  // Se for hoje
  if (diff < 24 * 60 * 60 * 1000 && now.getDate() === date.getDate()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Hoje, ${hours}:${minutes}`;
  }
  
  // Se for ontem
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.getDate() === date.getDate() && yesterday.getMonth() === date.getMonth()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Ontem, ${hours}:${minutes}`;
  }
  
  // Data completa
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Item da lista de treinos recentes
 */
export default function WorkoutListItem({ workout, onPress }) {
  const iconData = getWorkoutIcon(workout.type);
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconData.color }]}>
        <VectorIcons.MaterialCommunityIcons 
          name={iconData.name} 
          size={28} 
          color="white" 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{workout.title}</Text>
        <Text style={styles.date}>{formatDate(workout.endedAt || workout.startedAt)}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <VectorIcons.MaterialCommunityIcons 
              name="clock-outline" 
              size={14} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.statText}>{formatDuration(workout.durationSec)}</Text>
          </View>
          
          {workout.distanceM > 0 && (
            <View style={styles.stat}>
              <VectorIcons.MaterialCommunityIcons 
                name="map-marker-distance" 
                size={14} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.statText}>{formatDistance(workout.distanceM)}</Text>
            </View>
          )}
          
          {workout.caloriesEst > 0 && (
            <View style={styles.stat}>
              <VectorIcons.MaterialCommunityIcons 
                name="fire" 
                size={14} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.statText}>{workout.caloriesEst} kcal</Text>
            </View>
          )}
        </View>
      </View>
      
      <VectorIcons.MaterialCommunityIcons 
        name="chevron-right" 
        size={24} 
        color={COLORS.textSecondary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: SIZES.padding,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});
