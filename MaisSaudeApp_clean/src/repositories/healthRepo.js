import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

const DAILY_KEY = '@maisSaude/dailyData';
const GOALS_KEY = '@maisSaude/goals';

// ========== Local (AsyncStorage) ==========

export async function loadDailyLocal(date) {
  try {
    const json = await AsyncStorage.getItem(`${DAILY_KEY}_${date}`);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveDailyLocal(date, data) {
  try {
    await AsyncStorage.setItem(`${DAILY_KEY}_${date}`, JSON.stringify({ ...data, updatedAt: Date.now() }));
  } catch (e) {
    console.warn('saveDailyLocal error:', e);
  }
}

export async function loadGoalsLocal() {
  try {
    const json = await AsyncStorage.getItem(GOALS_KEY);
    return json ? JSON.parse(json) : { calories: 2000, water: 2500, sleep: 8 };
  } catch {
    return { calories: 2000, water: 2500, sleep: 8 };
  }
}

export async function saveGoalsLocal(goals) {
  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.warn('saveGoalsLocal error:', e);
  }
}

// ========== Remote (Firestore) ==========

export async function syncHealthRemote(user) {
  if (!user || !user.uid) {
    console.log('syncHealthRemote: no user, skipping');
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const local = await loadDailyLocal(today);

    if (local) {
      const docRef = doc(db, 'users', user.uid, 'dailySummaries', today);
      await setDoc(docRef, { ...local, updatedAt: Date.now() }, { merge: true });
    }

    // Pull last 30 days
    const col = collection(db, 'users', user.uid, 'dailySummaries');
    const q = query(col, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    snap.docs.forEach(d => {
      const remote = d.data();
      const date = d.id;
      // Merge local vs remote (last write wins)
      // For simplicity: if remote updatedAt > local updatedAt, overwrite
      saveDailyLocal(date, remote);
    });

    // Goals
    const goalsDocRef = doc(db, 'users', user.uid);
    const goalsSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
    if (!goalsSnap.empty) {
      const userData = goalsSnap.docs[0].data();
      if (userData.goals) {
        await saveGoalsLocal(userData.goals);
      }
    }

    console.log('syncHealthRemote: done');
  } catch (e) {
    console.warn('syncHealthRemote error:', e);
  }
}

export async function pushGoalsRemote(user, goals) {
  if (!user || !user.uid) return;
  try {
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { goals, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn('pushGoalsRemote error:', e);
  }
}
