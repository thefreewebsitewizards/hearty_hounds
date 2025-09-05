// Firebase configuration for React app
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCDy5hBMFfqzWQinV0sLLZAFh8koVZE5Qk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ksenia-munoz.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ksenia-munoz",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ksenia-munoz.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "982189236395",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:982189236395:web:594648694ec020153f17ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (temporarily disabled to use production Firebase)
if (false && process.env.NODE_ENV === 'development') {
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    
    // Connect to Firestore emulator (port 8080 from firebase.json)
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Firebase emulators already connected or not available');
  }
} else {
  console.log('🔥 Connected to production Firebase');
}



export default app;