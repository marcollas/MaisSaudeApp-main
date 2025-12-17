import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured } from '@/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase is not configured (src/firebase/config.js). Authentication calls will fail until firebaseConfig is set.');
      setLoading(false);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const mustConfigured = () => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Paste your firebaseConfig into src/firebase/config.js (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).');
  };

  const signIn = (email, password) => { mustConfigured(); return signInWithEmailAndPassword(auth, email, password); };
  const signUp = (email, password) => { mustConfigured(); return createUserWithEmailAndPassword(auth, email, password); };
  const resetPassword = (email) => { mustConfigured(); return sendPasswordResetEmail(auth, email); };
  const logout = () => { mustConfigured(); return signOut(auth); };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
