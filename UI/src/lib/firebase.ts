import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Syncare Firebase Configuration
export const firebaseConfig = {
  apiKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSyDJi2deayd7qV4efNDjDVxw652AAuFg248",
  authDomain: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "syncare-f7ec3.firebaseapp.com",
  projectId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "syncare-f7ec3",
  storageBucket: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "syncare-f7ec3.firebasestorage.app",
  messagingSenderId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "333952341377",
  appId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_APP_ID) || "1:333952341377:web:2608049b2bc45b41c38480",
  measurementId: (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID) || "G-MX9598XBMJ",
};

// Initialize Firebase App (singleton pattern across SSR & client)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Safe client-side analytics initialization
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics could not be initialized:", err);
    });
}

export { analytics };
export default app;
