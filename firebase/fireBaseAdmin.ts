import admin from "firebase-admin";

// Check if the environment variable exists
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  throw new Error(
    "Missing FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable"
  );
}

try {
  // Parse the JSON string
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
  );

  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  throw error;
}

export default admin;
