import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD-29bFX3O_-c6g2SqrF8ZJf-Z4kmc1LSw",
    authDomain: "valuetracker-ebf1f.firebaseapp.com",
    projectId: "valuetracker-ebf1f",
    storageBucket: "valuetracker-ebf1f.firebasestorage.app",
    messagingSenderId: "731846681901",
    appId: "1:731846681901:web:2c06b7859f3fae54859fa4",
    measurementId: "G-J3B1FWM5JM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, Timestamp };
