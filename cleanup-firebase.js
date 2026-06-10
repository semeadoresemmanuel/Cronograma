import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0uYNig4SorITPVJlTUZ9fhhGEE3m-tlI",
  authDomain: "cronograma-433c0.firebaseapp.com",
  projectId: "cronograma-433c0",
  storageBucket: "cronograma-433c0.firebasestorage.app",
  messagingSenderId: "361716391913",
  appId: "1:361716391913:web:28614faf66a8966311b578"
};

async function cleanup() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const querySnapshot = await getDocs(collection(db, "items"));
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (!data.date || typeof data.date !== 'string') {
      console.log(`Deleting invalid doc: ${document.id}`);
      await deleteDoc(doc(db, "items", document.id));
    }
  }
  console.log("Cleanup finished.");
  process.exit(0);
}

cleanup();
