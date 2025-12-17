import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import workoutStorage from '../storage/workoutStorage';

const WorkoutsContext = createContext({});

/**
 * Provider para gerenciar o estado dos treinos
 */
export function WorkoutsProvider({ children }) {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega workouts do storage ao iniciar
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const data = await workoutStorage.loadWorkouts();
        if (mounted) {
          setWorkouts(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar treinos:', error);
        if (mounted) {
          setWorkouts([]);
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Adiciona um novo treino
   */
  const addWorkout = useCallback(async (workout) => {
    try {
      await workoutStorage.addWorkout(workout);
      setWorkouts(prev => [workout, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar treino:', error);
      throw error;
    }
  }, []);

  /**
   * Remove um treino
   */
  const removeWorkout = useCallback(async (id) => {
    try {
      await workoutStorage.removeWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Erro ao remover treino:', error);
      throw error;
    }
  }, []);

  /**
   * Atualiza um treino
   */
  const updateWorkout = useCallback(async (id, patch) => {
    try {
      await workoutStorage.updateWorkout(id, patch);
      setWorkouts(prev =>
        prev.map(w => (w.id === id ? { ...w, ...patch } : w))
      );
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      throw error;
    }
  }, []);

  /**
   * Recarrega workouts do storage
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await workoutStorage.loadWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Erro ao recarregar treinos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calcula resumo da semana (últimos 7 dias)
   */
  const getWeeklySummary = useCallback(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const weekWorkouts = workouts.filter(w => {
      const endDate = new Date(w.endedAt).getTime();
      return endDate >= weekAgo && endDate <= now;
    });

    const totalDurationSec = weekWorkouts.reduce((sum, w) => sum + (w.durationSec || 0), 0);
    const totalDistanceM = weekWorkouts.reduce((sum, w) => sum + (w.distanceM || 0), 0);
    const totalCalories = weekWorkouts.reduce((sum, w) => sum + (w.caloriesEst || 0), 0);

    return {
      count: weekWorkouts.length,
      totalDurationSec,
      totalDistanceM,
      totalCalories,
    };
  }, [workouts]);

  const value = {
    workouts,
    isLoading,
    addWorkout,
    removeWorkout,
    updateWorkout,
    refresh,
    getWeeklySummary,
  };

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de workouts
 */
export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (!context) {
    throw new Error('useWorkouts deve ser usado dentro de um WorkoutsProvider');
  }
  return context;
}

export default WorkoutsContext;
