import {
 addDoc,
 collection,
 doc,
 onSnapshot,
 orderBy,
 query,
 runTransaction,
 serverTimestamp,
 Timestamp,
 where,
} from "firebase/firestore";
import { db } from "../firebase";

// statuses/{statusId} -> status doc, expiresAt = createdAt + 24h
// statusViews/{uid_statusId} -> { uid, statusId, createdAt }

export interface StatusDoc {
 creatorId: string;
 creatorName: string;
 creatorAvatar: string;
 mediaUrl: string;
 caption: string;
 createdAt: any;
 expiresAt: Timestamp;
 viewsCount: number;
}

export function subscribeToActiveStatuses(cb: (statuses: (StatusDoc & { id: string })[]) => void) {
 const q = query(
 collection(db, "statuses"),
 where("expiresAt", ">", Timestamp.now()),
 orderBy("expiresAt", "asc")
 );
 return onSnapshot(q, (snap) => {
 cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as StatusDoc) })));
 });
}

export function subscribeToUserStatusViews(uid: string, cb: (viewed: Set<string>) => void) {
 const q = query(collection(db, "statusViews"), where("uid", "==", uid));
 return onSnapshot(q, (snap) => {
 cb(new Set(snap.docs.map((d) => d.data().statusId as string)));
 });
}

export async function createStatus(data: {
 creatorId: string;
 creatorName: string;
 creatorAvatar: string;
 mediaUrl: string;
 caption: string;
}) {
 const now = Date.now();
 const expiresAt = Timestamp.fromMillis(now + 24 * 60 * 60 * 1000);
 await addDoc(collection(db, "statuses"), {
 ...data,
 createdAt: serverTimestamp(),
 expiresAt,
 viewsCount: 0,
 });
}

function viewDocId(uid: string, statusId: string) {
 return `${uid}_${statusId}`;
}

export async function markStatusViewed(uid: string, statusId: string) {
 const viewRef = doc(db, "statusViews", viewDocId(uid, statusId));
 const statusRef = doc(db, "statuses", statusId);

 await runTransaction(db, async (tx) => {
 const viewSnap = await tx.get(viewRef);
 if (viewSnap.exists()) return; // already counted
 const statusSnap = await tx.get(statusRef);
 if (!statusSnap.exists()) return;
 tx.set(viewRef, { uid, statusId, createdAt: serverTimestamp() });
 tx.update(statusRef, { viewsCount: (statusSnap.data().viewsCount ?? 0) + 1 });
 });
}

