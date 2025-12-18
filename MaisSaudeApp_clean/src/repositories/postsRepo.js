import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

const POSTS_KEY = '@maisSaude/posts';

// ========== Local (AsyncStorage) ==========

export async function loadPostsLocal() {
  try {
    const json = await AsyncStorage.getItem(POSTS_KEY);
    if (!json) return [];
    const posts = JSON.parse(json);
    return Array.isArray(posts) ? posts : [];
  } catch (e) {
    console.warn('loadPostsLocal error:', e);
    return [];
  }
}

export async function savePostsLocal(posts) {
  try {
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('savePostsLocal error:', e);
  }
}

export async function addPostLocal(post) {
  const posts = await loadPostsLocal();
  posts.unshift(post);
  await savePostsLocal(posts);
}

export async function updatePostLocal(postId, updates) {
  const posts = await loadPostsLocal();
  const idx = posts.findIndex(p => p.id === postId);
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...updates, updatedAt: Date.now() };
    await savePostsLocal(posts);
  }
}

export async function deletePostLocal(postId) {
  const posts = await loadPostsLocal();
  const filtered = posts.filter(p => p.id !== postId);
  await savePostsLocal(filtered);
}

// ========== Remote (Firestore) ==========

export async function syncPostsRemote(user) {
  if (!user || !user.uid) {
    console.log('syncPostsRemote: no user, skipping');
    return;
  }

  try {
    // Load local
    const local = await loadPostsLocal();

    // Push pending local (createdAt > last sync or updatedAt > last sync)
    const lastSync = await getLastSyncTimestamp('posts');
    const pending = local.filter(p => (p.createdAt || 0) > lastSync || (p.updatedAt || 0) > lastSync);

    for (const post of pending) {
      const docRef = doc(db, 'posts', post.id);
      await setDoc(docRef, {
        ...post,
        userId: user.uid,
        updatedAt: Date.now(),
      }, { merge: true });
    }

    // Pull remote newer
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Merge: last write wins
    const merged = mergeByLastWrite(local, remote);
    await savePostsLocal(merged);

    await setLastSyncTimestamp('posts', Date.now());
    console.log('syncPostsRemote: done');
  } catch (e) {
    console.warn('syncPostsRemote error:', e);
  }
}

// ========== Helpers ==========

function mergeByLastWrite(local, remote) {
  const map = {};
  local.forEach(p => { map[p.id] = p; });
  remote.forEach(p => {
    const existing = map[p.id];
    if (!existing || (p.updatedAt || 0) > (existing.updatedAt || 0)) {
      map[p.id] = p;
    }
  });
  return Object.values(map).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function getLastSyncTimestamp(key) {
  try {
    const val = await AsyncStorage.getItem(`@maisSaude/lastSync_${key}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

async function setLastSyncTimestamp(key, timestamp) {
  try {
    await AsyncStorage.setItem(`@maisSaude/lastSync_${key}`, String(timestamp));
  } catch (e) {
    console.warn('setLastSyncTimestamp error:', e);
  }
}
