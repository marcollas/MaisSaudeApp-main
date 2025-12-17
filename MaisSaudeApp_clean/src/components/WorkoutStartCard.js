import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

/**
 * Card para iniciar um tipo de treino
 */
export default function WorkoutStartCard({ 
  title, 
  icon = 'dumbbell', 
  color = COLORS.primary, 
  onPress 
}) {
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <VectorIcons.MaterialCommunityIcons 
        name={icon} 
        size={48} 
        color="white" 
      />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 140,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
});
