import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0uYNig4SorITPVJlTUZ9fhhGEE3m-tlI",
  authDomain: "cronograma-433c0.firebaseapp.com",
  projectId: "cronograma-433c0",
  storageBucket: "cronograma-433c0.firebasestorage.app",
  messagingSenderId: "361716391913",
  appId: "1:361716391913:web:28614faf66a8966311b578"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
