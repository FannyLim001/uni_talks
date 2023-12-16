// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyChVLacmG2tvMUXIB4ZV-CXUb64kGzAc8I",
	authDomain: "uni-talks-444d2.firebaseapp.com",
	projectId: "uni-talks-444d2",
	storageBucket: "uni-talks-444d2.appspot.com",
	messagingSenderId: "653423945919",
	appId: "1:653423945919:web:88ed6e643b4421329e3e0a",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
