import {
 addDoc,
 collection,
 doc,
 onSnapshot,
 orderBy,
 query,
 runTransaction,
 serverTimestamp,
 updateDoc,
 increment,
 where,
} from "firebase/firestore";
import { db } from "../firebase";
import { MemePost, Category, PostType } from "../../types";

// memes/{memeId} -> meme doc (no per-user isLiked/isSaved on the doc itself)
// memeLikes/{uid_memeId} -> { uid, memeId, reaction, createdAt }
// memeSaves/{uid_memeId} -> { uid, memeId, createdAt }

export interface MemeDoc {
 creatorId: string;
 createdAt: any;
 category: Category;
 type: PostType;
 mediaUrl: string;
 duration?: string;
 caption: string;
 hashtags: string[];
 likesCount: number;
 commentsCount: number;
 sharesCount: number;
 downloadsCount: number;
}

export function subscribeToMemes(cb: (memes: (MemeDoc & { id: string })[]) => void) {
 const q = query(collection(db, "memes"), orderBy("createdAt", "desc"));
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as MemeDoc) })));
 });
}

export function subscribeToUserMemeLikes(
 uid: string,
 cb: (likes: Map<string, string>) => void
) {
 const q = query(collection(db, "memeLikes"), where("uid", "==", uid));
 return onSnapshot(q, (snap) => {
 const map = new Map<string, string>();
 snap.docs.forEach((d) => map.set(d.data().memeId, d.data().reaction || ""));
 cb(map);
 });
}

export function subscribeToUserMemeSaves(uid: string, cb: (saved: Set<string>) => void) {
 const q = query(collection(db, "memeSaves"), where("uid", "==", uid));
 return onSnapshot(q, (snap) => {
 cb(new Set(snap.docs.map((d) => d.data().memeId as string)));
 });
}

export async function createMeme(data: Omit<MemeDoc, "createdAt" | "likesCount" | "commentsCount" | "sharesCount" | "downloadsCount">) {
 await addDoc(collection(db, "memes"), {
 ...data,
 createdAt: serverTimestamp(),
 likesCount: 0,
 commentsCount: 0,
 sharesCount: 0,
 downloadsCount: 0,
 });
}

function likeDocId(uid: string, memeId: string) {
 return `${uid}_${memeId}`;
}

export async function toggleLikeMeme(uid: string, memeId: string, reaction = "") {
 const likeRef = doc(db, "memeLikes", likeDocId(uid, memeId));
 const memeRef = doc(db, "memes", memeId);

 await runTransaction(db, async (tx) => {
 const likeSnap = await tx.get(likeRef);
 if (likeSnap.exists()) {
 tx.delete(likeRef);
 tx.update(memeRef, { likesCount: increment(-1) });
 } else {
 tx.set(likeRef, { uid, memeId, reaction, createdAt: serverTimestamp() });
 tx.update(memeRef, { likesCount: increment(1) });
 }
 });
}

export async function setMemeReaction(uid: string, memeId: string, reaction: string) {
 const likeRef = doc(db, "memeLikes", likeDocId(uid, memeId));
 const memeRef = doc(db, "memes", memeId);

 await runTransaction(db, async (tx) => {
 const likeSnap = await tx.get(likeRef);
 if (likeSnap.exists()) {
 tx.update(likeRef, { reaction });
 } else {
 tx.set(likeRef, { uid, memeId, reaction, createdAt: serverTimestamp() });
 tx.update(memeRef, { likesCount: increment(1) });
 }
 });
}

export async function toggleSaveMeme(uid: string, memeId: string) {
 const saveRef = doc(db, "memeSaves", likeDocId(uid, memeId));
 await runTransaction(db, async (tx) => {
 const saveSnap = await tx.get(saveRef);
 if (saveSnap.exists()) {
 tx.delete(saveRef);
 } else {
 tx.set(saveRef, { uid, memeId, createdAt: serverTimestamp() });
 }
 });
}

export async function incrementShareCount(memeId: string) {
 await updateDoc(doc(db, "memes", memeId), { sharesCount: increment(1) });
}

export async function incrementDownloadCount(memeId: string) {
 await updateDoc(doc(db, "memes", memeId), { downloadsCount: increment(1) });
}

