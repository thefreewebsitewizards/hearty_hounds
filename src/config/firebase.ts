import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration for Hearty Hounds
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA0sI3wwOM3it9RIwbW_UbcCHs6cwOeg7E",
  authDomain: "hearty-hounds.firebaseapp.com",
  projectId: "hearty-hounds",
  storageBucket: "hearty-hounds.firebasestorage.app",
  messagingSenderId: "751610479126",
  appId: "1:751610479126:web:845a5dcd620f5499ff2b37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;