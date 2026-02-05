import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import firebaseConfigJson from './firebaseconfig.json';
const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG // || firebaseConfigJson;
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;