import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0uYNig4SorITPVJlTUZ9fhhGEE3m-tlI",
  authDomain: "cronograma-433c0.firebaseapp.com",
  projectId: "cronograma-433c0",
  storageBucket: "cronograma-433c0.firebasestorage.app",
  messagingSenderId: "361716391913",
  appId: "1:361716391913:web:28614faf66a8966311b578"
};

async function test() {
  console.log("Initializing Firebase...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  try {
    console.log("Attempting to write to 'items' collection...");
    const docRef = await addDoc(collection(db, "items"), {
      test: true,
      message: "Hello from Node.js test script",
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    
    console.log("Attempting to read from 'items' collection...");
    const querySnapshot = await getDocs(collection(db, "items"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => `, doc.data());
    });
    
    console.log("SUCCESS! Firebase is working perfectly.");
  } catch (e) {
    console.error("FIREBASE ERROR: ", e);
  }
}

test();
