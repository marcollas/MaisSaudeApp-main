import { db } from '@/firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

export async function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  const payload = { ...data };
  if (!payload.createdAt) payload.createdAt = serverTimestamp();
  await setDoc(ref, payload, { merge: true });
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function fetchWorkouts() {
  const q = query(collection(db, 'workouts'), orderBy('createdAt', 'desc'));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchWorkoutsByUser(uid) {
  const q = query(collection(db, 'workouts'), orderBy('createdAt', 'desc'));
  const snaps = await getDocs(q);
  // filter client-side by user for simplicity in MVP
  return snaps.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(w => w.userId === uid);
}

export async function createWorkout(data) {
  const ref = collection(db, 'workouts');
  const payload = { ...data };
  if (!payload.createdAt) payload.createdAt = serverTimestamp();
  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

export async function fetchPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createPost(data) {
  const ref = collection(db, 'posts');
  const docRef = await addDoc(ref, data);
  return docRef.id;
}

export async function ensureUserProfileExists(uid, defaults = {}) {
  const existing = await getUserProfile(uid);
  if (existing) return existing;
  const data = {
    name: defaults.name || 'Usuário',
    avatar: defaults.avatar || null,
    ...defaults,
  };
  await createUserProfile(uid, data);
  return data;
}
