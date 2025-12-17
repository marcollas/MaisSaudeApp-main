/**
 * Estrutura de dados para o resumo diário de métricas de saúde
 * @typedef {Object} DailySummary
 * @property {string} date - Data no formato YYYY-MM-DD
 * @property {number} calories - Calorias consumidas no dia (kcal)
 * @property {number} waterMl - Água consumida no dia (mL)
 * @property {number} sleepMin - Sono total do dia (minutos)
 */

/**
 * Estrutura de dados para as metas do usuário
 * @typedef {Object} Goals
 * @property {number} caloriesGoal - Meta diária de calorias (kcal)
 * @property {number} waterGoalMl - Meta diária de água (mL)
 * @property {number} sleepGoalMin - Meta diária de sono (minutos)
 */

/**
 * Valores padrão para as metas (baseados na UI atual)
 */
export const DEFAULT_GOALS = {
  caloriesGoal: 3220,
  waterGoalMl: 2000,
  sleepGoalMin: 480, // 8 horas = 480 minutos
};

/**
 * Cria um novo resumo diário vazio para a data especificada
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {DailySummary}
 */
export function createEmptyDaily(date) {
  return {
    date,
    calories: 0,
    waterMl: 0,
    sleepMin: 0,
  };
}

/**
 * Cria um objeto de metas com valores padrão
 * @returns {Goals}
 */
export function createDefaultGoals() {
  return { ...DEFAULT_GOALS };
}

/**
 * Calcula o progresso percentual (0 a 1) de um valor em relação à meta
 * @param {number} value - Valor atual
 * @param {number} goal - Meta
 * @returns {number} - Valor entre 0 e 1
 */
export function calculateProgress(value, goal) {
  if (!goal || goal <= 0) return 0;
  const progress = value / goal;
  return Math.min(Math.max(progress, 0), 1); // clamp entre 0 e 1
}

/**
 * Valida se um número está dentro de limites razoáveis
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean}
 */
export function isValidNumber(value, min = 0, max = 999999) {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Limites de validação para cada métrica
 */
export const VALIDATION_LIMITS = {
  calories: { min: 0, max: 20000 },
  water: { min: 0, max: 20000 },
  sleep: { min: 0, max: 1440 }, // 0 a 24h em minutos
};

/**
 * Limites de validação para edição de metas
 */
export const GOAL_LIMITS = {
  calories: { min: 800, max: 8000 },
  water: { min: 500, max: 10000 },
  sleep: { min: 60, max: 720 }, // 1h a 12h em minutos
};

/**
 * Valida se uma meta está dentro dos limites aceitáveis
 * @param {number} value - Valor da meta
 * @param {string} type - Tipo da métrica ('calories', 'water', 'sleep')
 * @returns {boolean}
 */
export function isValidGoal(value, type) {
  const limits = GOAL_LIMITS[type];
  if (!limits) return false;
  return isValidNumber(value, limits.min, limits.max);
}
