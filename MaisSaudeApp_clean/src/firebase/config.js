// Replace the empty config below with your Firebase project's config object
// Get these values from the Firebase console -> Project settings -> Your apps
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // values extracted from google-services.json
  apiKey: "AIzaSyBFhQ2XdTE2hArC8gUtrgiN34FYiQgWEBs",
  authDomain: "maissaudeapp-f5e26.firebaseapp.com",
  projectId: "maissaudeapp-f5e26",
  storageBucket: "maissaudeapp-f5e26.firebasestorage.app",
  messagingSenderId: "276558350768",
  appId: "1:276558350768:android:416e55a037db4cf916ae75"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('REPLACE_ME'));
