import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

const WORKOUTS_KEY = '@maisSaude/workouts';

// ========== Local (AsyncStorage) ==========

export async function loadWorkoutsLocal() {
  try {
    const json = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!json) return [];
    const workouts = JSON.parse(json);
    return Array.isArray(workouts) ? workouts : [];
  } catch {
    return [];
  }
}

export async function saveWorkoutsLocal(workouts) {
  try {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (e) {
    console.warn('saveWorkoutsLocal error:', e);
  }
}

export async function addWorkoutLocal(workout) {
  const workouts = await loadWorkoutsLocal();
  workouts.unshift(workout);
  await saveWorkoutsLocal(workouts);
}

export async function deleteWorkoutLocal(workoutId) {
  const workouts = await loadWorkoutsLocal();
  const filtered = workouts.filter(w => w.id !== workoutId);
  await saveWorkoutsLocal(filtered);
}

// ========== Remote (Firestore) ==========

export async function syncWorkoutsRemote(user) {
  if (!user || !user.uid) {
    console.log('syncWorkoutsRemote: no user, skipping');
    return;
  }

  try {
    const local = await loadWorkoutsLocal();
    const lastSync = await getLastSyncTimestamp('workouts');
    const pending = local.filter(w => (w.createdAt || 0) > lastSync || (w.updatedAt || 0) > lastSync);

    for (const workout of pending) {
      const docRef = doc(db, 'users', user.uid, 'workouts', workout.id);
      await setDoc(docRef, { ...workout, updatedAt: Date.now() }, { merge: true });
    }

    // Pull remote
    const col = collection(db, 'users', user.uid, 'workouts');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const merged = mergeByLastWrite(local, remote);
    await saveWorkoutsLocal(merged);

    await setLastSyncTimestamp('workouts', Date.now());
    console.log('syncWorkoutsRemote: done');
  } catch (e) {
    console.warn('syncWorkoutsRemote error:', e);
  }
}

// ========== Helpers ==========

function mergeByLastWrite(local, remote) {
  const map = {};
  local.forEach(w => { map[w.id] = w; });
  remote.forEach(w => {
    const existing = map[w.id];
    if (!existing || (w.updatedAt || 0) > (existing.updatedAt || 0)) {
      map[w.id] = w;
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
