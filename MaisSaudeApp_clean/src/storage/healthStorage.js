import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves de armazenamento
const KEYS = {
  DAILY: '@maisSaude:daily:v1',
  GOALS: '@maisSaude:goals:v1',
  HISTORY: '@maisSaude:history:v1',
};

/**
 * Lê um valor JSON do AsyncStorage
 * @param {string} key - Chave para buscar
 * @returns {Promise<any|null>} - Retorna o objeto parseado ou null se não existir
 */
export async function getJSON(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Erro ao ler ${key}:`, error);
    return null;
  }
}

/**
 * Salva um valor JSON no AsyncStorage
 * @param {string} key - Chave para salvar
 * @param {any} value - Valor a ser salvo (será convertido para JSON)
 * @returns {Promise<void>}
 */
export async function setJSON(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.warn(`Erro ao salvar ${key}:`, error);
  }
}

/**
 * Remove um valor do AsyncStorage
 * @param {string} key - Chave a ser removida
 * @returns {Promise<void>}
 */
export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`Erro ao remover ${key}:`, error);
  }
}

// Funções específicas para dados de saúde
export const HealthStorage = {
  /**
   * Carrega o resumo diário
   * @returns {Promise<Object|null>}
   */
  async loadDaily() {
    return await getJSON(KEYS.DAILY);
  },

  /**
   * Salva o resumo diário
   * @param {Object} daily - Objeto com date, calories, waterMl, sleepMin
   * @returns {Promise<void>}
   */
  async saveDaily(daily) {
    await setJSON(KEYS.DAILY, daily);
  },

  /**
   * Carrega as metas
   * @returns {Promise<Object|null>}
   */
  async loadGoals() {
    return await getJSON(KEYS.GOALS);
  },

  /**
   * Salva as metas
   * @param {Object} goals - Objeto com caloriesGoal, waterGoalMl, sleepGoalMin
   * @returns {Promise<void>}
   */
  async saveGoals(goals) {
    await setJSON(KEYS.GOALS, goals);
  },

  /**
   * Carrega o histórico
   * @returns {Promise<Array|null>}
   */
  async loadHistory() {
    return await getJSON(KEYS.HISTORY);
  },

  /**
   * Salva o histórico
   * @param {Array} history - Array de resumos diários
   * @returns {Promise<void>}
   */
  async saveHistory(history) {
    await setJSON(KEYS.HISTORY, history);
  },

  /**
   * Limpa todos os dados de saúde (útil para reset ou logout)
   * @returns {Promise<void>}
   */
  async clearAll() {
    await removeItem(KEYS.DAILY);
    await removeItem(KEYS.GOALS);
    await removeItem(KEYS.HISTORY);
  },
};

export default HealthStorage;
