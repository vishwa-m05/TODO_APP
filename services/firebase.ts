import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };
const firebaseConfig = {
  apiKey: "AIzaSyDwNBjcqCnJ4fj0NyT6bh-kiJ-3G9Tn1Os",
  authDomain: "kavin-todo-app.firebaseapp.com",
  projectId: "kavin-todo-app",
  storageBucket: "kavin-todo-app.firebasestorage.app",
  messagingSenderId: "405082727386",
  appId: "1:405082727386:web:20930ce0c7f393940b96e3",
  measurementId: "G-T3ZJEC5J05"
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS !== 'web') {
  // For React Native (iOS, Android), use async storage for persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  // For web, Firebase Auth handles persistence automatically
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;
