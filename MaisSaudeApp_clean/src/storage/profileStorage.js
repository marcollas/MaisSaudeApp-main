/**
 * Storage de perfil do usuário usando AsyncStorage
 * Persistência local para nome e foto de perfil
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@maisSaude/profile';

/**
 * Estrutura do perfil
 * @typedef {Object} Profile
 * @property {string} name - Nome do usuário
 * @property {string|null} photoUri - URI da foto (file:// ou http://)
 */

/**
 * Carrega perfil do AsyncStorage
 * @returns {Promise<Profile|null>}
 */
export async function getProfile() {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.warn('Erro ao carregar perfil:', error);
    return null;
  }
}

/**
 * Salva perfil no AsyncStorage
 * @param {Profile} profile - Dados do perfil
 * @returns {Promise<boolean>}
 */
export async function saveProfile(profile) {
  try {
    if (!profile) {
      throw new Error('Perfil inválido');
    }

    // Valida estrutura mínima
    const data = {
      name: profile.name || 'Usuário',
      photoUri: profile.photoUri || null,
    };

    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Erro ao salvar perfil:', error);
    return false;
  }
}

/**
 * Remove perfil do AsyncStorage
 * @returns {Promise<boolean>}
 */
export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
    return true;
  } catch (error) {
    console.warn('Erro ao limpar perfil:', error);
    return false;
  }
}

/**
 * Atualiza apenas a foto do perfil
 * @param {string|null} photoUri - Nova URI da foto
 * @returns {Promise<boolean>}
 */
export async function updateProfilePhoto(photoUri) {
  try {
    const profile = await getProfile();
    if (!profile) {
      // Se não existe perfil, cria um básico
      return saveProfile({ name: 'Usuário', photoUri });
    }

    profile.photoUri = photoUri;
    return saveProfile(profile);
  } catch (error) {
    console.warn('Erro ao atualizar foto do perfil:', error);
    return false;
  }
}

/**
 * Atualiza apenas o nome do perfil
 * @param {string} name - Novo nome
 * @returns {Promise<boolean>}
 */
export async function updateProfileName(name) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return saveProfile({ name, photoUri: null });
    }

    profile.name = name || 'Usuário';
    return saveProfile(profile);
  } catch (error) {
    console.warn('Erro ao atualizar nome do perfil:', error);
    return false;
  }
}
