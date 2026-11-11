import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const getSavedFirebaseConfig = (): FirebaseClientConfig | null => {
  // 1. Check Vite Environment Variables (ideal for Vercel deployment)
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
    };
  }

  // 2. Check localStorage saved config (configured via Settings UI)
  try {
    const raw = localStorage.getItem('trio_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading saved Firebase config:', err);
  }
  return null;
};

export const initFirebase = (config?: FirebaseClientConfig): { app: FirebaseApp | null; db: Firestore | null; auth: Auth | null; isConnected: boolean } => {
  const activeConfig = config || getSavedFirebaseConfig();

  if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId) {
    return { app: null, db: null, auth: null, isConnected: false };
  }

  try {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(activeConfig);
    }
    try {
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
      });
    } catch {
      db = getFirestore(app);
    }
    auth = getAuth(app);

    // Save for persistent reuse
    localStorage.setItem('trio_firebase_config', JSON.stringify(activeConfig));

    return { app, db, auth, isConnected: true };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return { app: null, db: null, auth: null, isConnected: false };
  }
};

export const getFirebaseDb = (): Firestore | null => db;
export const getFirebaseAuth = (): Auth | null => auth;
