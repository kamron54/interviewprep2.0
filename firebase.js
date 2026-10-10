// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// On the live site, Google's sign-in window runs on our own domain (vercel.json forwards /__/auth/
// to Firebase), so it says "continue to interviewprep.center" instead of the firebaseapp.com address.
// Previews and local dev keep Firebase's address: Google only accepts sign-in windows from the
// addresses listed in the Google Cloud OAuth client.
const SITE_DOMAIN = "interviewprep.center";
const authDomain = typeof window !== "undefined" && window.location.hostname === SITE_DOMAIN
  ? SITE_DOMAIN
  : "interview-prep-b2dd4.firebaseapp.com";

const firebaseConfig = {
  apiKey: "AIzaSyBmpwf7GfAVKKxWKICvEEJMskw2L_45b5w",
  authDomain,
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

