import React, { createContext, useContext, useEffect, useState } from "react";
import {
 onAuthStateChanged,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signInWithPopup,
 GoogleAuthProvider,
 signOut as fbSignOut,
 updateProfile,
 User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
 currentUser: User | null;
 loading: boolean;
 signIn: (email: string, password: string) => Promise<void>;
 signUp: (email: string, password: string, name: string, handle: string) => Promise<void>;
 signInWithGoogle: () => Promise<void>;
 signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error("useAuth must be used within AuthProvider");
 return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [currentUser, setCurrentUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const unsub = onAuthStateChanged(auth, (user) => {
 setCurrentUser(user);
 setLoading(false);
 });
 return unsub;
 }, []);

 const signIn = async (email: string, password: string) => {
 await signInWithEmailAndPassword(auth, email, password);
 };

 const signUp = async (email: string, password: string, name: string, handle: string) => {
 const cred = await createUserWithEmailAndPassword(auth, email, password);
 await updateProfile(cred.user, { displayName: name });
 await setDoc(doc(db, "users", cred.user.uid), {
 name,
 handle,
 avatar: "",
 email,
 createdAt: serverTimestamp(),
 });
 };

 const signInWithGoogle = async () => {
 const provider = new GoogleAuthProvider();
 const cred = await signInWithPopup(auth, provider);

 // If this is the user's first time signing in, create their Firestore profile.
 const userRef = doc(db, "users", cred.user.uid);
 const existing = await getDoc(userRef);
 if (!existing.exists()) {
 const fallbackHandle =
 (cred.user.email?.split("@")[0] || "user") + Math.floor(Math.random() * 1000);
 await setDoc(userRef, {
 name: cred.user.displayName || "New user",
 handle: fallbackHandle,
 avatar: cred.user.photoURL || "",
 email: cred.user.email || "",
 createdAt: serverTimestamp(),
 });
 }
 };

 const signOut = async () => {
 await fbSignOut(auth);
 };

 return (
 <AuthContext.Provider
 value={{ currentUser, loading, signIn, signUp, signInWithGoogle, signOut }}
 >
 {children}
 </AuthContext.Provider>
 );
};

