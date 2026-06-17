import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

let app;
let db: any;
let auth: any;
let isMockFirebase = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Try to load firestore
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Optional verification of Firestore state
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error: any) {
      if (error && error.message && error.message.includes("offline")) {
        console.warn("Firebase: client is offline, using offline capabilities.");
      }
    }
  };
  testConnection();

} catch (error) {
  console.warn("Firebase initialization failed. Operating in premium local sandbox fallback mode.", error);
  isMockFirebase = true;
  
  // Set up mock representations so the rest of the application imports won't break
  app = {};
  db = {
    // simple spy-mock structure if needed, but our auth hook will handle local-state fallback
  };
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // simulate signed out in mock mode
      callback(null);
      return () => {};
    }
  };
}

export { app, db, auth, isMockFirebase };
