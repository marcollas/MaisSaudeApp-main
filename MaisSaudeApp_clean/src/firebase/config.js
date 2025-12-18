// Replace the empty config below with your Firebase project's config object
// Get these values from the Firebase console -> Project settings -> Your apps
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  // values extracted from google-services.json
  apiKey: "AIzaSyBFhQ2XdTE2hArC8gUtrgiN34FYiQgWEBs",
  authDomain: "maissaudeapp-f5e26.firebaseapp.com",
  projectId: "maissaudeapp-f5e26",
  storageBucket: "maissaudeapp-f5e26.appspot.com",
  messagingSenderId: "276558350768",
  appId: "1:276558350768:android:416e55a037db4cf916ae75"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('REPLACE_ME'));
