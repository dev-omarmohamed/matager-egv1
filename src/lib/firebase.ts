/**
 * Firebase Client Initialization & Singleton Instances
 *
 * Configured for Matager Cloud infrastructure with:
 * - Firebase Realtime Database (rtdb / database)
 * - Firebase Authentication (auth)
 * - Firebase Analytics (analytics)
 * - Firebase Cloud Storage (storage)
 * - Cloud Firestore (db)
 *
 * Protected via environment variables with safe defaults for matager-egv01.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD_yJ3inVvSzwSPAQPtpXJSYgxH5J2gajo",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "matager-egv01.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://matager-egv01-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "matager-egv01",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "matager-egv01.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "789251938163",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:789251938163:web:9bff4eff91f73abfb61706",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-77YTXR85KB",
};

// Singleton Firebase App instance
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Auth Instance
export const auth: Auth = getAuth(app);

// Realtime Database Instance (Live telemetry, order sync, POS terminals)
export const rtdb: Database = getDatabase(app, firebaseConfig.databaseURL);
export const database: Database = rtdb; // Alias for standard RTDB naming

// Firebase Cloud Storage Instance (Product media, store logos, receipts)
export const storage: FirebaseStorage = getStorage(app);

// Cloud Firestore Instance (Document Store)
export const db: Firestore = getFirestore(app);

// Firebase Analytics Instance (Browser client only, SSR-safe)
let analyticsInstance: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch(() => null);
}
export const analytics: Analytics | null = analyticsInstance;
