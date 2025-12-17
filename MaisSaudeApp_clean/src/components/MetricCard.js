import React from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SIZES } from '../constants/theme';

const CARD_HEIGHT = 110;
const PROGRESS_SIZE = 72;
const STROKE_WIDTH = 8;
const RADIUS = (PROGRESS_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function clampProgress(value) {
  if (Number.isNaN(value) || typeof value !== 'number') return 0;
  return Math.min(Math.max(value, 0), 1);
}

export default function MetricCard({
  title,
  icon,
  valueText,
  goalText,
  progress = 0,
  color = COLORS.primary,
  onPress,
}) {
  const pct = clampProgress(progress);
  const strokeDashoffset = CIRCUMFERENCE * (1 - pct);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#e6e6e6' }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: '#F0F7F3' }]}>
          <VectorIcons.MaterialCommunityIcons name={icon} size={26} color={color} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{valueText}</Text>
          <Text style={styles.goal}>{goalText}</Text>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <Svg width={PROGRESS_SIZE} height={PROGRESS_SIZE}>
          <Circle
            stroke="#E6E6E6"
            fill="none"
            cx={PROGRESS_SIZE / 2}
            cy={PROGRESS_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
          />
          <Circle
            stroke={color}
            fill="none"
            cx={PROGRESS_SIZE / 2}
            cy={PROGRESS_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${PROGRESS_SIZE / 2}, ${PROGRESS_SIZE / 2}`}
          />
        </Svg>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MetricCardSkeleton() {
  return <View style={styles.skeleton} />;
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  goal: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressWrapper: {
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  skeleton: {
    height: CARD_HEIGHT,
    backgroundColor: '#E9E9E9',
    borderRadius: SIZES.radius,
    marginBottom: 14,
    opacity: 0.7,
  },
});
