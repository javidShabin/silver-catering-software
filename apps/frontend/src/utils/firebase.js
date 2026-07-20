import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpLJsST8wn6dgvW3lB0mudJZ20zLkmjsI",
  authDomain: "do-catering-system.firebaseapp.com",
  projectId: "do-catering-system",
  storageBucket: "do-catering-system.firebasestorage.app",
  messagingSenderId: "624684000262",
  appId: "1:624684000262:web:a0640632a21b9befe0cf87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Optional: you can add custom parameters here if needed
// googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, googleProvider, storage };
