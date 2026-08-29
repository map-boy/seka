import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestore: Firestore | null = null;

/** Lazily initialised so importing a handler never touches the network. */
export function getDb(): Firestore {
  if (!firestore) {
    if (getApps().length === 0) initializeApp();
    firestore = getFirestore();
  }
  return firestore;
}
