import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
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
    db = getFirestore(app);
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
