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
  apiKey: "YOUR_API_KEY", // <- INSERISCI LA TUA API KEY
  authDomain: "calendario-fire-71782510.firebaseapp.com", // Aggiornato
  projectId: "calendario-fire-71782510", // Aggiornato dall'immagine
  storageBucket: "calendario-fire-71782510.appspot.com", // Aggiornato
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <- INSERISCI IL TUO SENDER ID
  appId: "YOUR_APP_ID" // <- INSERISCI IL TUO APP ID
};

// Inizializza Firebase solo se non è già stato fatto
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Esporta l'istanza di Firestore da utilizzare nell'applicazione
const db = getFirestore(app);

export { db };