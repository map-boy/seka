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

// comments/{commentId} -> comment doc
// commentLikes/{uid_commentId} -> { uid, commentId, createdAt }

export interface CommentDoc {
 memeId: string;
 authorId: string;
 authorName: string;
 authorAvatar: string;
 text: string;
 createdAt: any;
 likesCount: number;
}

export function subscribeToComments(memeId: string, cb: (comments: (CommentDoc & { id: string })[]) => void) {
 const q = query(collection(db, "comments"), where("memeId", "==", memeId), orderBy("createdAt", "asc"));
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CommentDoc) })));
 });
}

export function subscribeToUserCommentLikes(uid: string, cb: (liked: Set<string>) => void) {
 const q = query(collection(db, "commentLikes"), where("uid", "==", uid));
 return onSnapshot(q, (snap) => {
 cb(new Set(snap.docs.map((d) => d.data().commentId as string)));
 });
}

export async function addComment(
 memeId: string,
 authorId: string,
 authorName: string,
 authorAvatar: string,
 text: string
) {
 await addDoc(collection(db, "comments"), {
 memeId,
 authorId,
 authorName,
 authorAvatar,
 text,
 createdAt: serverTimestamp(),
 likesCount: 0,
 });
 await updateDoc(doc(db, "memes", memeId), { commentsCount: increment(1) });
}

function likeDocId(uid: string, commentId: string) {
 return `${uid}_${commentId}`;
}

export async function toggleLikeComment(uid: string, commentId: string) {
 const likeRef = doc(db, "commentLikes", likeDocId(uid, commentId));
 const commentRef = doc(db, "comments", commentId);

 await runTransaction(db, async (tx) => {
 const likeSnap = await tx.get(likeRef);
 if (likeSnap.exists()) {
 tx.delete(likeRef);
 tx.update(commentRef, { likesCount: increment(-1) });
 } else {
 tx.set(likeRef, { uid, commentId, createdAt: serverTimestamp() });
 tx.update(commentRef, { likesCount: increment(1) });
 }
 });
}

