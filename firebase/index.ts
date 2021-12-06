// Import the functions you need from the SDKs you need
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getApp, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

export namespace FireBase {
  export function init() {
    try {
      return getApp();
    } catch {
      return initializeApp(firebaseConfig);
    }
  }
  export function auth() {
    init();
    return getAuth();
  }
  export function fireStore() {
    init();
    return getFirestore();
  }
}
