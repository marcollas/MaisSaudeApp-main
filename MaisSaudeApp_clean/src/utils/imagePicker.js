/**
 * Utilitário centralizado para seleção e processamento de imagens
 * Compatível 100% com Expo Go (sem código nativo)
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Solicita permissão de galeria
 * @returns {Promise<boolean>} true se permissão concedida
 */
export async function requestMediaPermission() {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Erro ao solicitar permissão:', error);
    return false;
  }
}

/**
 * Abre galeria e permite escolher imagem
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.allowsEditing - Permitir crop (default: false)
 * @param {number} options.aspect - Aspect ratio [w,h] para crop (default: [1,1])
 * @param {number} options.quality - Qualidade 0-1 (default: 0.8)
 * @returns {Promise<{uri: string, width: number, height: number} | null>}
 */
export async function pickImageFromLibrary(options = {}) {
  try {
    const {
      allowsEditing = false,
      aspect = [1, 1],
      quality = 0.8,
    } = options;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });

    // Verifica se foi cancelado (API atualizada usa 'canceled' sem 'd' duplo)
    if (result.canceled) {
      return null;
    }

    // Retorna o primeiro asset selecionado
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return null;
    }

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.warn('Erro ao abrir galeria:', error);
    throw new Error('Não foi possível abrir a galeria. ' + (error?.message || ''));
  }
}

/**
 * Copia imagem para diretório do app com nome único
 * @param {string} uri - URI da imagem original
 * @param {string} prefix - Prefixo para o nome do arquivo (ex: 'profile', 'post')
 * @returns {Promise<string>} URI estável no diretório do app
 */
export async function saveImageToAppDir(uri, prefix = 'img') {
  try {
    if (!uri) {
      throw new Error('URI da imagem não fornecida');
    }

    // Helper para extrair extensão da imagem
    const getFileExtension = (u) => {
      const noQuery = u.split('?')[0]; // Remove query params
      const parts = noQuery.split('.');
      const ext = parts[parts.length - 1];
      // Valida extensão (max 5 chars, comum em imagens)
      return ext && ext.length <= 5 ? ext : 'jpg';
    };

    // Gera nome único com extensão correta
    const ext = getFileExtension(uri);
    const timestamp = Date.now();
    const filename = `${prefix}_${timestamp}.${ext}`;
    const destination = FileSystem.documentDirectory + filename;

    // Copia arquivo para diretório do app
    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });

    return destination;
  } catch (error) {
    console.warn('Erro ao salvar imagem:', error);
    throw new Error('Não foi possível salvar a imagem. ' + (error?.message || ''));
  }
}

/**
 * Deleta imagem do diretório do app
 * @param {string} uri - URI da imagem a ser deletada
 * @returns {Promise<boolean>} true se deletado com sucesso
 */
export async function deleteImageFromAppDir(uri) {
  try {
    if (!uri || !uri.startsWith('file://')) {
      return false;
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Erro ao deletar imagem:', error);
    return false;
  }
}

/**
 * Solicita permissão e abre câmera para tirar foto
 * @param {Object} options - Opções de configuração
 * @returns {Promise<{uri: string, width: number, height: number} | null>}
 */
export async function takePictureWithCamera(options = {}) {
  try {
    // Solicita permissão de câmera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão de câmera negada');
    }

    const {
      allowsEditing = false,
      aspect = [1, 1],
      quality = 0.8,
    } = options;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return null;
    }

    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.warn('Erro ao tirar foto:', error);
    throw new Error('Não foi possível tirar a foto. ' + (error?.message || ''));
  }
}
