import admin from "firebase-admin";

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in the private key from .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("[Firebase Admin] Initialized successfully.");
  } catch (error) {
    console.error("[Firebase Admin] Initialization error:", error.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { admin, db };
