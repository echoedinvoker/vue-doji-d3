import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function addActivity(data: Activity) {
  const docRef = await addDoc(collection(db, 'activities'), data)

  return { ...data, id: docRef.id }
}

