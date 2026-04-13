import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "barterly-64865398-4cda8",
  appId: "1:791045231240:web:4cfcb6aceb3cf4260ac53d",
  apiKey: "AIzaSyAnlN9keAiIjp5JgzUga_PZoXp4diTayyc",
  authDomain: "barterly-64865398-4cda8.firebaseapp.com",
  storageBucket: "barterly-64865398-4cda8.firebasestorage.app",
  messagingSenderId: "791045231240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;