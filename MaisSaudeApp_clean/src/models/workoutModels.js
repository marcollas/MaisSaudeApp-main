/**
 * Modelos e utilitários para treinos
 */

/**
 * Tipos de treino suportados
 */
export const WORKOUT_TYPES = {
  RUN: 'run',
  WALK: 'walk',
  STRENGTH: 'strength',
  OTHER: 'other',
};

/**
 * METs (Metabolic Equivalent of Task) para diferentes atividades
 * Usado para estimar gasto calórico
 */
export const MET_VALUES = {
  walk: 3.5,
  run: 7.0,
  strength: 3.0,
  other: 2.5,
};

/**
 * Cria um WorkoutEntry vazio/novo
 * @param {string} type - Tipo do treino (run, walk, strength, other)
 * @returns {Object} WorkoutEntry
 */
export function createWorkoutEntry(type = WORKOUT_TYPES.OTHER) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: getDefaultTitle(type),
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationSec: 0,
    distanceM: 0,
    avgPaceSecPerKm: null,
    caloriesEst: 0,
    notes: '',
    strength: null,
  };
}

/**
 * Retorna o título padrão para cada tipo de treino
 */
function getDefaultTitle(type) {
  const titles = {
    run: 'Corrida',
    walk: 'Caminhada',
    strength: 'Treino de Força',
    other: 'Treino Livre',
  };
  return titles[type] || 'Treino';
}

/**
 * Calcula o gasto calórico estimado
 * @param {string} type - Tipo de treino
 * @param {number} durationSec - Duração em segundos
 * @param {number} weightKg - Peso do usuário em kg (default: 70)
 * @returns {number} Calorias estimadas
 */
export function estimateCalories(type, durationSec, weightKg = 70) {
  const met = MET_VALUES[type] || MET_VALUES.other;
  const durationHours = durationSec / 3600;
  return Math.round(met * weightKg * durationHours);
}

/**
 * Calcula o ritmo médio em segundos por km
 * @param {number} durationSec - Duração total em segundos
 * @param {number} distanceM - Distância total em metros
 * @returns {number|null} Segundos por km ou null se distância inválida
 */
export function calculatePace(durationSec, distanceM) {
  if (!distanceM || distanceM <= 0) return null;
  const distanceKm = distanceM / 1000;
  return Math.round(durationSec / distanceKm);
}

/**
 * Formata duração em segundos para string legível
 * @param {number} seconds - Duração em segundos
 * @returns {string} Ex: "1h 23m" ou "45m 30s" ou "12s"
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Formata ritmo (segundos por km) para string legível
 * @param {number} secPerKm - Segundos por km
 * @returns {string} Ex: "5:30/km"
 */
export function formatPace(secPerKm) {
  if (!secPerKm || secPerKm <= 0) return '--';
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.floor(secPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

/**
 * Formata distância em metros para string legível
 * @param {number} meters - Distância em metros
 * @returns {string} Ex: "5.2 km" ou "850 m"
 */
export function formatDistance(meters) {
  if (!meters || meters <= 0) return '0 m';
  
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(2);
    return `${km} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Valida se um workout está completo e pronto para ser salvo
 * @param {Object} workout - WorkoutEntry
 * @returns {boolean}
 */
export function isValidWorkout(workout) {
  if (!workout.id || !workout.type) return false;
  if (!workout.startedAt || !workout.endedAt) return false;
  if (workout.durationSec <= 0) return false;
  return true;
}

/**
 * Calcula distância entre duas coordenadas usando Haversine
 * @param {number} lat1 - Latitude ponto 1
 * @param {number} lon1 - Longitude ponto 1
 * @param {number} lat2 - Latitude ponto 2
 * @param {number} lon2 - Longitude ponto 2
 * @returns {number} Distância em metros
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
