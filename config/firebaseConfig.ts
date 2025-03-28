import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.BACKEND_FIREBASE_API_KEY,
    authDomain: process.env.BACKEND_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.BACKEND_FIREBASE_PROJECT_ID,
    storageBucket: process.env.BACKEND_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.BACKEND_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.BACKEND_FIREBASE_APP_ID,
    measurementId: process.env.BACKEND_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIRESTORE_DB = getFirestore(FIREBASE_APP);

export { FIREBASE_APP, FIRESTORE_DB };