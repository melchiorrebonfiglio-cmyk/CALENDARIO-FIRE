import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ===================================================================================
// ATTENZIONE: AZIONE RICHIESTA!
// ===================================================================================
// Ho aggiornato il `projectId` a "calendario-fire-71782510" basandomi sull'immagine
// che hai fornito. Ora devi completare la configurazione con le altre credenziali
// REALI del tuo progetto.
//
// COME OTTENERE LE ALTRE CREDENZIALI:
// 1. Vai su https://console.firebase.google.com/ e apri il tuo progetto "CALENDARIO-FIRE".
// 2. Vai nelle "Impostazioni del progetto" (icona a forma di ingranaggio in alto a sinistra).
// 3. Nella scheda "Generali", scorri verso il basso fino a "Le tue app".
// 4. Se non hai un'app web, creane una cliccando sull'icona '</>'.
// 5. Cerca la sezione "Configurazione" o "SDK setup and configuration".
// 6. Seleziona "Config" e copia l'intero oggetto JavaScript.
// 7. Incolla l'oggetto qui sotto, sostituendo completamente quello di esempio.
//
const firebaseConfig = {
  apiKey: "AIzaSyDle6eVzVT__Nhb0zR3m5vq1Xf_1_qKA8E", // <- INSERISCI LA TUA API KEY
  authDomain: "calendario-giustificativi.firebaseapp.com", // Aggiornato
  projectId: "calendario-giustificativi", // Aggiornato dall'immagine
  storageBucket: "calendario-giustificativi.firebasestorage.app", // Aggiornato
  messagingSenderId: "1007450344962", // <- INSERISCI IL TUO SENDER ID
  appId: "1:1007450344962:web:fd035e27a53dfe912ee11b" // <- INSERISCI IL TUO APP ID
};

// Inizializza Firebase solo se non è già stato fattocalendario-giustificativi.firebaseapp.com
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Esporta l'istanza di Firestore da utilizzare nell'applicazione
const db = getFirestore(app);

export { db };