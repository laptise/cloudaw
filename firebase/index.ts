// Import the functions you need from the SDKs you need
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getApp, initializeApp } from "firebase/app";
import { browserLocalPersistence, setPersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

export namespace FireBase {
  export async function init() {
    try {
      return getApp();
    } catch {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
      return app;
    }
  }
  export async function auth() {
    console.log(firebaseConfig);
    await init();
    return getAuth();
  }
  export async function fireStore() {
    await init();
    return getFirestore();
  }
}
