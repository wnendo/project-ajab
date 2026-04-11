import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDnjZcbhtm03HNLQHSr6Wlz6TqOfB-KU9E",
  authDomain: "ranking-ajab.firebaseapp.com",
  projectId: "ranking-ajab",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)