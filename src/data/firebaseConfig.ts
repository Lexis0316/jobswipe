// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyGZkrsJoYZ1f4vero_myXhawcJxmdIVs",
  authDomain: "jobswipe-36aef.firebaseapp.com",
  projectId: "jobswipe-36aef",
  storageBucket: "jobswipe-36aef.firebasestorage.app",
  messagingSenderId: "866068338359",
  appId: "1:866068338359:web:a2a95fa2b26631b5811f32",
  measurementId: "G-57Z8KV0PGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);