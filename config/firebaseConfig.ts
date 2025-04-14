import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import dotenv from 'dotenv';
import fs from 'fs';
import * as admin from "firebase-admin";

dotenv.config();

// Read the Firebase Admin SDK JSON dynamically
const serviceAccountPath = process.env.BACKEND_FIREBASE_ADMIN_PATH;

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  throw new Error("Firebase Admin SDK JSON file not found! Check BACKEND_FIREBASE_ADMIN_PATH.");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Firebase Config
const firebaseConfig = {
    apiKey: process.env.BACKEND_FIREBASE_API_KEY,
    authDomain: process.env.BACKEND_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.BACKEND_FIREBASE_PROJECT_ID,
    storageBucket: process.env.BACKEND_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.BACKEND_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.BACKEND_FIREBASE_APP_ID,
    measurementId: process.env.BACKEND_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIRESTORE_DB = getFirestore(FIREBASE_APP);

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const FIREBASE_ADMIN = admin;
const FIRESTORE_ADMIN = FIREBASE_ADMIN.firestore();

export { FIREBASE_APP, FIRESTORE_DB, FIREBASE_ADMIN, FIRESTORE_ADMIN };
