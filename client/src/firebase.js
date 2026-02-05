import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBs0CqFuhakRwGCG8zGEgxSiwwF3aO3mB4",
  authDomain: "goaltrackerapp-371fc.firebaseapp.com",
  databaseURL: "https://goaltrackerapp-371fc-default-rtdb.firebaseio.com",
  projectId: "goaltrackerapp-371fc",
  storageBucket: "goaltrackerapp-371fc.firebasestorage.app",
  messagingSenderId: "223651168030",
  appId: "1:223651168030:web:fc05ad7f755b3fe6d9d30f",
  measurementId: "G-18QJY22BVF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;