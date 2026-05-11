const { admin } = require("../config/firebase");
const { error: logError } = require("../utils/logger");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      code: "unauthorized",
      userMessage: "You must be logged in to access this resource.",
    });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not configured in the backend.");
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logError("Auth", "Failed to verify Firebase token", {
      message: error.message,
    });
    return res.status(401).json({
      error: "Unauthorized",
      code: "unauthorized",
      userMessage: "Your session has expired or is invalid. Please log in again.",
    });
  }
}

module.exports = { requireAuth };
