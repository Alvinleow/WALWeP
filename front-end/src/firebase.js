// src/firebase.js (client-side)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChVrUntR4dI86qx3IC_WuT9Zsyzqfh3vE",
  authDomain: "walwep-349b6.firebaseapp.com",
  projectId: "walwep-349b6",
  storageBucket: "walwep-349b6.firebasestorage.app",
  messagingSenderId: "645062245062",
  appId: "1:645062245062:web:a1c0c355a93f29563235c7",
  measurementId: "G-3VZ0L2QFEK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
