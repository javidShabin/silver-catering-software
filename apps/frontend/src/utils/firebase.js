import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLYobfktsqQYhca7FKHr7jJ2_4Nus42GI",
  authDomain: "silver-catering-f6e00.firebaseapp.com",
  projectId: "silver-catering-f6e00",
  storageBucket: "silver-catering-f6e00.firebasestorage.app",
  messagingSenderId: "314443591811",
  appId: "1:314443591811:web:f4953c6fd72bc2622cabb6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Optional: you can add custom parameters here if needed
// googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, googleProvider, storage };
