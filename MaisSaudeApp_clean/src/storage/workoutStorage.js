import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = '@maisSaude:workouts:v1';

/**
 * Storage layer para histórico de treinos
 */

// Helper para ler JSON do AsyncStorage
async function getJSON(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Erro ao ler ${key}:`, error);
    return null;
  }
}

// Helper para salvar JSON no AsyncStorage
async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
}

/**
 * Carrega todos os treinos do storage
 * @returns {Promise<Array>} Array de WorkoutEntry
 */
export async function loadWorkouts() {
  const workouts = await getJSON(WORKOUTS_KEY);
  return workouts || [];
}

/**
 * Salva lista completa de treinos no storage
 * @param {Array} workouts - Array de WorkoutEntry
 */
export async function saveWorkouts(workouts) {
  await setJSON(WORKOUTS_KEY, workouts);
}

/**
 * Adiciona um novo treino ao histórico
 * @param {Object} workout - WorkoutEntry
 */
export async function addWorkout(workout) {
  const workouts = await loadWorkouts();
  workouts.unshift(workout); // Adiciona no início (mais recente)
  await saveWorkouts(workouts);
}

/**
 * Remove um treino do histórico
 * @param {string} id - ID do treino
 */
export async function removeWorkout(id) {
  const workouts = await loadWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  await saveWorkouts(filtered);
}

/**
 * Atualiza um treino existente
 * @param {string} id - ID do treino
 * @param {Object} patch - Campos a atualizar
 */
export async function updateWorkout(id, patch) {
  const workouts = await loadWorkouts();
  const index = workouts.findIndex(w => w.id === id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...patch };
    await saveWorkouts(workouts);
  }
}

export default {
  loadWorkouts,
  saveWorkouts,
  addWorkout,
  removeWorkout,
  updateWorkout,
};
