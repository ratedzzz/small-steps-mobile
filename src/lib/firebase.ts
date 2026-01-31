import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// @ts-ignore - TypeScript sometimes misses the React Native specific exports
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

// extracted from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCSz37Aup0OygYdBXU0FQKmN3xoCeOyMRQ",
  authDomain: "small-steps-c273b.firebaseapp.com",
  projectId: "small-steps-c273b",
  storageBucket: "small-steps-c273b.firebasestorage.app",
  messagingSenderId: "1069007933931",
  appId: "1:1069007933931:web:909944a2fe88a5676909ae",
  measurementId: "G-SW9YLYH49S"
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 3. Initialize and Export Firestore Database
export const db = getFirestore(app);