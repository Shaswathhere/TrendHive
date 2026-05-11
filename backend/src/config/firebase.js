const admin = require("firebase-admin");
const { error: logError, info } = require("../utils/logger");

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
    info("Firebase", "Firebase Admin SDK initialized successfully.");
  } catch (error) {
    logError("Firebase", "Firebase Admin initialization error", {
      message: error.message,
    });
  }
}

const db = admin.apps.length ? admin.firestore() : null;

module.exports = { admin, db };
