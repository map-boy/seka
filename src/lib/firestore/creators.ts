import {
 collection,
 doc,
 onSnapshot,
 query,
 where,
 runTransaction,
 serverTimestamp,
 getDoc,
 updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Creator } from "../../types";

export function subscribeToCreators(cb: (creators: Creator[]) => void) {
 const q = query(collection(db, "users"));
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Creator, "id">) })));
 });
}

export function subscribeToFollowing(uid: string, cb: (followingIds: Set<string>) => void) {
 const q = query(collection(db, "follows"), where("followerId", "==", uid));
 return onSnapshot(q, (snap) => {
 cb(new Set(snap.docs.map((d) => d.data().followingId as string)));
 });
}

function followDocId(followerId: string, followingId: string) {
 return `${followerId}_${followingId}`;
}

export async function toggleFollow(followerId: string, followingId: string) {
 if (followerId === followingId) return;
 const followRef = doc(db, "follows", followDocId(followerId, followingId));
 const followerRef = doc(db, "users", followerId);
 const followingRef = doc(db, "users", followingId);

 await runTransaction(db, async (tx) => {
 const followSnap = await tx.get(followRef);
 const followerSnap = await tx.get(followerRef);
 const followingSnap = await tx.get(followingRef);
 if (!followerSnap.exists() || !followingSnap.exists()) return;

 if (followSnap.exists()) {
 tx.delete(followRef);
 tx.update(followerRef, {
 followingCount: Math.max(0, (followerSnap.data().followingCount ?? 1) - 1),
 });
 tx.update(followingRef, {
 followerCount: Math.max(0, (followingSnap.data().followerCount ?? 1) - 1),
 });
 } else {
 tx.set(followRef, { followerId, followingId, createdAt: serverTimestamp() });
 tx.update(followerRef, { followingCount: (followerSnap.data().followingCount ?? 0) + 1 });
 tx.update(followingRef, { followerCount: (followingSnap.data().followerCount ?? 0) + 1 });
 }
 });
}

export async function updateCreatorProfile(uid: string, data: Partial<Omit<Creator, "id">>) {
 await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
}

export async function getCreator(uid: string): Promise<Creator | null> {
 const snap = await getDoc(doc(db, "users", uid));
 if (!snap.exists()) return null;
 return { id: snap.id, ...(snap.data() as Omit<Creator, "id">) };
}

