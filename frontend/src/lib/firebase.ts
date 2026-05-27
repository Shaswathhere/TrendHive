import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = process.env;

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDhJOMrfp-qAf41_XTFA2jhpjUVNunt1ak",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "trendhive-ec5ad.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "trendhive-ec5ad",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "trendhive-ec5ad.firebasestorage.app",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "299227317227",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:299227317227:web:324f59295e023de7458fae",
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RFB6JCZHTC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
