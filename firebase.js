// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmpwf7GfAVKKxWKICvEEJMskw2L_45b5w",
  authDomain: "interview-prep-b2dd4.firebaseapp.com",
  projectId: "interview-prep-b2dd4",
  storageBucket: "interview-prep-b2dd4.firebasestorage.app",
  messagingSenderId: "870054159246",
  appId: "1:870054159246:web:5ac028055e9680b260fadf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export these named constants
export const auth = getAuth(app);
export const db = getFirestore(app);

