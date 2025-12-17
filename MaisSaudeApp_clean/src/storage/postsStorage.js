/**
 * Storage de posts/publicações usando AsyncStorage
 * Persistência local para feed social
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTS_KEY = '@maisSaude/posts';

/**
 * Estrutura de um post
 * @typedef {Object} Post
 * @property {string} id - ID único
 * @property {string} text - Texto da publicação
 * @property {string|null} imageUri - URI da imagem anexada
 * @property {number} createdAt - Timestamp de criação
 * @property {string} authorName - Nome do autor
 * @property {string|null} authorPhotoUri - Foto do autor
 */

/**
 * Carrega todos os posts
 * @returns {Promise<Post[]>}
 */
export async function getPosts() {
  try {
    const data = await AsyncStorage.getItem(POSTS_KEY);
    if (!data) {
      return [];
    }
    const posts = JSON.parse(data);
    // Ordena por data (mais recentes primeiro)
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.warn('Erro ao carregar posts:', error);
    return [];
  }
}

/**
 * Salva lista completa de posts
 * @param {Post[]} posts - Array de posts
 * @returns {Promise<boolean>}
 */
async function savePosts(posts) {
  try {
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.warn('Erro ao salvar posts:', error);
    return false;
  }
}

/**
 * Adiciona novo post
 * @param {Object} postData - Dados do post (sem id)
 * @returns {Promise<Post|null>} Post criado ou null se erro
 */
export async function addPost(postData) {
  try {
    const posts = await getPosts();
    
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: postData.text || '',
      imageUri: postData.imageUri || null,
      createdAt: Date.now(),
      authorName: postData.authorName || 'Usuário',
      authorPhotoUri: postData.authorPhotoUri || null,
    };

    posts.unshift(newPost); // Adiciona no início
    await savePosts(posts);
    return newPost;
  } catch (error) {
    console.warn('Erro ao adicionar post:', error);
    return null;
  }
}

/**
 * Remove post por ID
 * @param {string} postId - ID do post
 * @returns {Promise<boolean>}
 */
export async function removePost(postId) {
  try {
    const posts = await getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    return savePosts(filtered);
  } catch (error) {
    console.warn('Erro ao remover post:', error);
    return false;
  }
}

/**
 * Limpa todos os posts
 * @returns {Promise<boolean>}
 */
export async function clearPosts() {
  try {
    await AsyncStorage.removeItem(POSTS_KEY);
    return true;
  } catch (error) {
    console.warn('Erro ao limpar posts:', error);
    return false;
  }
}

/**
 * Atualiza post existente
 * @param {string} postId - ID do post
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<boolean>}
 */
export async function updatePost(postId, updates) {
  try {
    const posts = await getPosts();
    const index = posts.findIndex(p => p.id === postId);
    
    if (index === -1) {
      return false;
    }

    posts[index] = { ...posts[index], ...updates };
    return savePosts(posts);
  } catch (error) {
    console.warn('Erro ao atualizar post:', error);
    return false;
  }
}
