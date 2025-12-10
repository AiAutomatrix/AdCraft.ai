// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Do not include "use server" here. This is a server-side utility module.

// Decode the base64 encoded service account key from environment variables.
// This is a secure way to handle credentials in Vercel.
const serviceAccountKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountKey) {
  throw new Error(
    'FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 is not set in the environment variables. This is required for server-side Firebase Admin operations.'
  );
}

// Decode the key from Base64 to a standard string.
const decodedServiceAccount = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decodedServiceAccount);

// Initialize the Firebase Admin SDK, but only if it hasn't been initialized already.
// This prevents errors in hot-reloading development environments.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    // Log a more detailed error to help with debugging initialization issues.
    console.error('Firebase Admin SDK initialization error:', error.stack);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

// Export a single, ready-to-use firestore instance.
// This instance can be imported into any server-side file (like API routes or server actions).
export const firestore = getFirestore();
