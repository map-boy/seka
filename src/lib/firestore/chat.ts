import {
 addDoc,
 arrayUnion,
 collection,
 doc,
 onSnapshot,
 orderBy,
 query,
 serverTimestamp,
 updateDoc,
 where,
 setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// chatThreads/{threadId} -> { participantIds, name, avatar, isGroup, lastMessage, lastMessageAt }
// chatThreads/{threadId}/messages/{msgId} -> { senderId, senderName, senderAvatar, text, memeId, createdAt }

export interface ChatThreadDoc {
 participantIds: string[];
 name: string;
 avatar: string;
 isGroup: boolean;
 lastMessage: string;
 lastMessageAt: any;
}

export interface ChatMessageDoc {
 senderId: string;
 senderName: string;
 senderAvatar: string;
 text?: string;
 memeId?: string;
 createdAt: any;
}

export function subscribeToThreads(uid: string, cb: (threads: (ChatThreadDoc & { id: string })[]) => void) {
 const q = query(
 collection(db, "chatThreads"),
 where("participantIds", "array-contains", uid),
 orderBy("lastMessageAt", "desc")
 );
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ChatThreadDoc) })));
 });
}

export function subscribeToMessages(threadId: string, cb: (messages: (ChatMessageDoc & { id: string })[]) => void) {
 const q = query(collection(db, "chatThreads", threadId, "messages"), orderBy("createdAt", "asc"));
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ChatMessageDoc) })));
 });
}

export async function createThread(data: {
 participantIds: string[];
 name: string;
 avatar: string;
 isGroup: boolean;
}) {
 const ref = await addDoc(collection(db, "chatThreads"), {
 ...data,
 lastMessage: "",
 lastMessageAt: serverTimestamp(),
 });
 return ref.id;
}

export async function sendMessage(
 threadId: string,
 senderId: string,
 senderName: string,
 senderAvatar: string,
 text?: string,
 memeId?: string
) {
 await addDoc(collection(db, "chatThreads", threadId, "messages"), {
 senderId,
 senderName,
 senderAvatar,
 text: text ?? null,
 memeId: memeId ?? null,
 createdAt: serverTimestamp(),
 });

 await updateDoc(doc(db, "chatThreads", threadId), {
 lastMessage: text || (memeId ? "Sent a meme" : ""),
 lastMessageAt: serverTimestamp(),
 });
}

