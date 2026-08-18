import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export type ReportTargetType = "meme" | "user";

export async function reportContent(
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: string
) {
  await addDoc(collection(db, "reports"), {
    reporterId,
    targetType,
    targetId,
    reason,
    createdAt: serverTimestamp(),
  });
}

function blockDocId(blockerId: string, blockedId: string) {
  return `${blockerId}_${blockedId}`;
}

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) return;
  await addDoc(collection(db, "blocks"), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  await deleteDoc(doc(db, "blocks", blockDocId(blockerId, blockedId)));
}

export function subscribeToBlockedUsers(uid: string, cb: (blockedIds: Set<string>) => void) {
  const q = query(collection(db, "blocks"), where("blockerId", "==", uid));
  return onSnapshot(q, (snap) => {
    cb(new Set(snap.docs.map((d) => d.data().blockedId as string)));
  });
}