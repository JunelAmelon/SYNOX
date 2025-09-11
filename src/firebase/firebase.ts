import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Messaging } from "firebase/messaging";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    // In unsupported environments (SSR, no SW), avoid crashing
    console.warn('Firebase Messaging not initialized:', e);
    messaging = null;
  }
}
// Initialize Firestore
const db = getFirestore(app);

// Note: Firebase emulators can be configured here if needed in development

export { app, auth, db, googleProvider };

export const generateToken = async (): Promise<string | null> => {
  try {
      if (typeof window === 'undefined') return null;
      const supported = await isSupported().catch(() => false);
      if (!supported || !messaging) return null;
      if (typeof Notification === 'undefined') return null;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
          console.error('NEXT_PUBLIC_FIREBASE_VAPID_KEY manquante');
          return null;
      }
      const token = await getToken(messaging, { vapidKey }).catch((err) => {
          console.error('getToken error:', err);
          return null;
      });
      if (token) {
          return token;
      }
      return null;
  } catch (err) {
      console.error('Erreur generateToken:', err);
      return null;
  }
}

export const onMessageListener = async () => {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported().catch(() => false);
  if (!supported || !messaging) return null;
  return new Promise((resolve) => {
      onMessage(messaging as Messaging, (payload) => {
          resolve(payload);
      });
  });
}