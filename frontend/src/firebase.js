// Firebase configuration
// Replace these with your actual Firebase project settings
// Get these from Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyADxNEEZ0ZIfiwksGFHPDaR918jT1RjtdU",
  authDomain: "gdg-hackathon-309c4.firebaseapp.com",
  projectId: "gdg-hackathon-309c4",
  storageBucket: "gdg-hackathon-309c4.appspot.com",
  messagingSenderId: "356399657253",
  appId: "your-app-id"
};

// For development/testing, you can use Firebase Emulator
// Uncomment the lines below to use local Firebase emulator
/*
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};
*/

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
