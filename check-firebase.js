import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0uYNig4SorITPVJlTUZ9fhhGEE3m-tlI",
  authDomain: "cronograma-433c0.firebaseapp.com",
  projectId: "cronograma-433c0",
  storageBucket: "cronograma-433c0.firebasestorage.app",
  messagingSenderId: "361716391913",
  appId: "1:361716391913:web:28614faf66a8966311b578"
};

async function test() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const querySnapshot = await getDocs(collection(db, "items"));
  const docs = querySnapshot.docs.map(d => d.data());
  console.log("Found items:", docs.length);
  docs.forEach(d => console.log(d.title));
  process.exit(0);
}

test();
