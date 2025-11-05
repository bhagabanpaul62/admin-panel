// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA55FZsHv_2LdIVzGmVRp_yn_8pv7CRtP4",
  authDomain: "service-by-local.firebaseapp.com",
  projectId: "service-by-local",
  storageBucket: "service-by-local.firebasestorage.app",
  messagingSenderId: "170723262171",
  appId: "1:170723262171:web:de516422eaf72c9420d6fe",
  measurementId: "G-H1G1K4YR7C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
