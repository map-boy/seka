import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadMemeImage(uid: string, dataUrl: string): Promise<string> {
  const fileName = `meme_${Date.now()}.png`;
  const storageRef = ref(storage, `memes/${uid}/${fileName}`);
  await uploadString(storageRef, dataUrl, "data_url");
  return getDownloadURL(storageRef);
}

export async function uploadMemeFile(uid: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const fileName = `meme_${Date.now()}.${ext}`;
  const storageRef = ref(storage, `memes/${uid}/${fileName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const storageRef = ref(storage, `avatars/${uid}/avatar.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
