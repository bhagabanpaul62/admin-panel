// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6zGgH4hYl9UaqfV3NB0bs_MpR7GfOA0E",
  authDomain: "servicebylocal-2ae50.firebaseapp.com",
  projectId: "servicebylocal-2ae50",
  storageBucket: "servicebylocal-2ae50.firebasestorage.app",
  messagingSenderId: "699159684205",
  appId: "1:699159684205:web:d71bc4561637b657044b64",
  measurementId: "G-P60XDHQCE4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)