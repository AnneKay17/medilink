
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc4hcwzCnGn9j9cBA9P6Fxk07dhs5SeOc",
  authDomain: "medilink-c76ff.firebaseapp.com",
  projectId: "medilink-c76ff",
  storageBucket: "medilink-c76ff.firebasestorage.app",
  messagingSenderId: "454604586703",
  appId: "1:454604586703:web:3337f9b27d242303f6c1ba",
  measurementId: "G-E3JCF8Q947"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;