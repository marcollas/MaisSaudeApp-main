import React, { createContext, useContext, useEffect, useState, useReducer, useRef } from 'react';
import HealthStorage from '../storage/healthStorage';
import { getTodayKey } from '../utils/date';
import { createEmptyDaily, createDefaultGoals, isValidNumber, VALIDATION_LIMITS, isValidGoal } from '../models/healthModels';

const HealthContext = createContext({});

// Action types para o reducer
const ACTIONS = {
  SET_READY: 'SET_READY',
  SET_DAILY: 'SET_DAILY',
  SET_GOALS: 'SET_GOALS',
  ADD_CALORIES: 'ADD_CALORIES',
  ADD_WATER: 'ADD_WATER',
  SET_SLEEP: 'SET_SLEEP',
  RESET_TODAY: 'RESET_TODAY',
  SET_CALORIES_GOAL: 'SET_CALORIES_GOAL',
  SET_WATER_GOAL: 'SET_WATER_GOAL',
  SET_SLEEP_GOAL: 'SET_SLEEP_GOAL',
};

// Reducer para gerenciar o estado
function healthReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_READY:
      return { ...state, isReady: action.payload };
    
    case ACTIONS.SET_DAILY:
      return { ...state, daily: action.payload };
    
    case ACTIONS.SET_GOALS:
      return { ...state, goals: action.payload };
    
    case ACTIONS.ADD_CALORIES:
      return {
        ...state,
        daily: {
          ...state.daily,
          calories: Math.max(0, state.daily.calories + action.payload),
        },
      };
    
    case ACTIONS.ADD_WATER:
      return {
        ...state,
        daily: {
          ...state.daily,
          waterMl: Math.max(0, state.daily.waterMl + action.payload),
        },
      };
    
    case ACTIONS.SET_SLEEP:
      return {
        ...state,
        daily: {
          ...state.daily,
          sleepMin: Math.max(0, action.payload),
        },
      };
    
    case ACTIONS.RESET_TODAY:
      return {
        ...state,
        daily: createEmptyDaily(getTodayKey()),
      };
    
    case ACTIONS.SET_CALORIES_GOAL:
      return {
        ...state,
        goals: {
          ...state.goals,
          caloriesGoal: action.payload,
        },
      };
    
    case ACTIONS.SET_WATER_GOAL:
      return {
        ...state,
        goals: {
          ...state.goals,
          waterGoalMl: action.payload,
        },
      };
    
    case ACTIONS.SET_SLEEP_GOAL:
      return {
        ...state,
        goals: {
          ...state.goals,
          sleepGoalMin: action.payload,
        },
      };
    
    default:
      return state;
  }
}

// Estado inicial
const initialState = {
  daily: createEmptyDaily(getTodayKey()),
  goals: createDefaultGoals(),
  isReady: false,
};

export function HealthProvider({ children }) {
  const [state, dispatch] = useReducer(healthReducer, initialState);
  const saveTimeoutRef = useRef(null);

  // Carrega dados do storage ao iniciar
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const today = getTodayKey();
        
        // Carrega as metas
        let goals = await HealthStorage.loadGoals();
        if (!goals) {
          goals = createDefaultGoals();
          await HealthStorage.saveGoals(goals);
        }

        // Carrega o resumo diário
        let daily = await HealthStorage.loadDaily();

        // Migração: remover campo steps se existir em dados antigos
        if (daily && typeof daily.steps !== 'undefined') {
          const { steps, ...rest } = daily;
          daily = rest;
          await HealthStorage.saveDaily(daily);
        }
        
        if (!daily || daily.date !== today) {
          // Se não existe ou é de outro dia, salvar no histórico (opcional)
          if (daily && daily.date !== today) {
            const history = (await HealthStorage.loadHistory()) || [];
            history.push(daily);
            await HealthStorage.saveHistory(history);
          }
          
          // Criar novo resumo para hoje
          daily = createEmptyDaily(today);
          await HealthStorage.saveDaily(daily);
        }

        if (mounted) {
          dispatch({ type: ACTIONS.SET_GOALS, payload: goals });
          dispatch({ type: ACTIONS.SET_DAILY, payload: daily });
          dispatch({ type: ACTIONS.SET_READY, payload: true });
        }
      } catch (error) {
        console.error('Erro ao carregar dados de saúde:', error);
        if (mounted) {
          dispatch({ type: ACTIONS.SET_READY, payload: true });
        }
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  // Salva daily no storage com debounce (evita muitas escritas)
  useEffect(() => {
    if (!state.isReady) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      HealthStorage.saveDaily(state.daily).catch((error) => {
        console.error('Erro ao salvar dados diários:', error);
      });
    }, 300); // debounce de 300ms

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.daily, state.isReady]);

  // Salva goals no storage quando mudam (se implementar edição de metas)
  useEffect(() => {
    if (!state.isReady) return;
    
    HealthStorage.saveGoals(state.goals).catch((error) => {
      console.error('Erro ao salvar metas:', error);
    });
  }, [state.goals, state.isReady]);

  // Actions
  const addCalories = (amount) => {
    if (!isValidNumber(amount, VALIDATION_LIMITS.calories.min, VALIDATION_LIMITS.calories.max)) {
      console.warn('Valor de calorias inválido:', amount);
      return;
    }
    dispatch({ type: ACTIONS.ADD_CALORIES, payload: amount });
  };

  const addWater = (amountMl) => {
    if (!isValidNumber(amountMl, VALIDATION_LIMITS.water.min, VALIDATION_LIMITS.water.max)) {
      console.warn('Valor de água inválido:', amountMl);
      return;
    }
    dispatch({ type: ACTIONS.ADD_WATER, payload: amountMl });
  };

  const setSleep = (minutes) => {
    if (!isValidNumber(minutes, VALIDATION_LIMITS.sleep.min, VALIDATION_LIMITS.sleep.max)) {
      console.warn('Valor de sono inválido:', minutes);
      return;
    }
    dispatch({ type: ACTIONS.SET_SLEEP, payload: minutes });
  };

  const resetToday = () => {
    dispatch({ type: ACTIONS.RESET_TODAY });
  };

  const setCaloriesGoal = (value) => {
    if (!isValidGoal(value, 'calories')) {
      console.warn('Meta de calorias inválida:', value);
      return;
    }
    dispatch({ type: ACTIONS.SET_CALORIES_GOAL, payload: value });
  };

  const setWaterGoalMl = (value) => {
    if (!isValidGoal(value, 'water')) {
      console.warn('Meta de água inválida:', value);
      return;
    }
    dispatch({ type: ACTIONS.SET_WATER_GOAL, payload: value });
  };

  const setSleepGoalMin = (value) => {
    if (!isValidGoal(value, 'sleep')) {
      console.warn('Meta de sono inválida:', value);
      return;
    }
    dispatch({ type: ACTIONS.SET_SLEEP_GOAL, payload: value });
  };

  const value = {
    daily: state.daily,
    goals: state.goals,
    isReady: state.isReady,
    addCalories,
    addWater,
    setSleep,
    resetToday,
    setCaloriesGoal,
    setWaterGoalMl,
    setSleepGoalMin,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth deve ser usado dentro de um HealthProvider');
  }
  return context;
};

export default HealthContext;
