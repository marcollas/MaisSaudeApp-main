import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, saveProfile } from '../storage/profileStorage';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega perfil do AsyncStorage no mount
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Carrega perfil do AsyncStorage
   */
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setProfile(data || { name: 'Usuário', photoUri: null });
    } catch (e) {
      console.warn('Erro ao carregar perfil:', e);
      setProfile({ name: 'Usuário', photoUri: null });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza perfil e salva no AsyncStorage
   * @param {Object} patch - Campos a atualizar (name, photoUri, etc)
   */
  const updateProfile = async (patch) => {
    try {
      const updated = {
        ...profile,
        ...patch,
      };
      await saveProfile(updated);
      setProfile(updated);
      return true;
    } catch (e) {
      console.warn('Erro ao atualizar perfil:', e);
      return false;
    }
  };

  /**
   * Recarrega perfil do AsyncStorage
   */
  const refreshProfile = async () => {
    await loadProfile();
  };

  const value = {
    profile,
    isLoading,
    updateProfile,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Hook para usar ProfileContext
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de ProfileProvider');
  }
  return context;
}
