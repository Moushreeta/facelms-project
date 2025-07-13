// final-version/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// IMPORT THE DATABASE AND AUTHENTICATION SERVICES
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This is YOUR personal key, which is correct.
const firebaseConfig = {
  apiKey: "AIzaSyBQTAa5J4Z0p5qhs1tx1aH93tAls1XjNA0",
  authDomain: "tomar-lms-project-2025.firebaseapp.com",
  projectId: "tomar-lms-project-2025",
  storageBucket: "tomar-lms-project-2025.appspot.com", // Corrected this line for you
  messagingSenderId: "1055641900545",
  appId: "1:1055641900545:web:82bb7f6034884f50af5200",
  measurementId: "G-9YVDZ1M65R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT THE SERVICES SO THE REST OF THE APP CAN USE THEM
export const db = getFirestore(app);
export const auth = getAuth(app);