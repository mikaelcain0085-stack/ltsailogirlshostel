import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANFYuo41qS8f_RokaUCyfknOz-c5ioQOU",
  authDomain: "lt-sailo-girls-hostel.firebaseapp.com",
  projectId: "lt-sailo-girls-hostel",
  storageBucket: "lt-sailo-girls-hostel.firebasestorage.app",
  messagingSenderId: "497014552524",
  appId: "1:497014552524:web:c632bed8140871567f4f69",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };