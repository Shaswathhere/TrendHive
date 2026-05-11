// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDhJOMrfp-qAf41_XTFA2jhpjUVNunt1ak",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "trendhive-ec5ad.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "trendhive-ec5ad",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "trendhive-ec5ad.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "299227317227",
  appId: env.VITE_FIREBASE_APP_ID || "1:299227317227:web:324f59295e023de7458fae",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-RFB6JCZHTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  getAnalytics(app);
}
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
