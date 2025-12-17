/**
 * Retorna a data de hoje no formato YYYY-MM-DD (sem problemas de timezone)
 * @returns {string} - Data no formato YYYY-MM-DD
 */
export function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata minutos em horas e minutos (ex: 390 -> "6h 30m")
 * @param {number} totalMinutes - Total de minutos
 * @returns {string} - String formatada
 */
export function formatSleepTime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Formata número com separador de milhares (ex: 1200 -> "1.200")
 * @param {number} value - Valor numérico
 * @returns {string} - String formatada
 */
export function formatNumber(value) {
  if (!value || value <= 0) return '0';
  return value.toLocaleString('pt-BR');
}

/**
 * Converte horas e minutos para total de minutos
 * @param {number} hours - Horas
 * @param {number} minutes - Minutos
 * @returns {number} - Total de minutos
 */
export function hoursMinutesToMinutes(hours, minutes) {
  return (hours * 60) + minutes;
}

/**
 * Converte total de minutos para objeto {hours, minutes}
 * @param {number} totalMinutes - Total de minutos
 * @returns {Object} - {hours: number, minutes: number}
 */
export function minutesToHoursMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

/**
 * Formata meta de sono para exibição (ex: 480min -> "8 horas")
 * @param {number} sleepGoalMin - Meta de sono em minutos
 * @returns {string} - String formatada para meta
 */
export function formatSleepGoal(sleepGoalMin) {
  if (!sleepGoalMin || sleepGoalMin <= 0) return '0 horas';
  const hours = Math.floor(sleepGoalMin / 60);
  const minutes = sleepGoalMin % 60;
  if (minutes === 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${minutes}m`;
}
