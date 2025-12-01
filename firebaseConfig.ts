import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configurazione per il progetto Firebase "agenda"
// Le credenziali sono state inserite come richiesto.
const firebaseConfig = {
  apiKey: "AIzaSyDWozN0LIWAIAXzrSkD-CLL2HZ1WQxB9NM",
  authDomain: "agenda-4f119.firebaseapp.com",
  projectId: "agenda-4f119",
  storageBucket: "agenda-4f119.appspot.com",
  messagingSenderId: "1010743014242",
  appId: "1:1010743014242:web:900ce8e3f81d9ca10a723b"
};

// Inizializza Firebase solo se non è già stato fatto per evitare errori di hot-reloading.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Esporta l'istanza di Firestore da utilizzare nell'applicazione.
const db = getFirestore(app);

export { db };
