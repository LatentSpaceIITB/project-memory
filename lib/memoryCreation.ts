/**
 * Firebase operations for creating memories
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface CreateMemoryResult {
  memoryId: string;
  inviteId: string;
  inviteLink: string;
}

/**
 * Generates a unique invite ID (shorter than memoryId for easier sharing)
 */
export function generateInviteId(): string {
  return crypto.randomUUID().slice(0, 12);
}

/**
 * Uploads photo to Firebase Storage
 */
export async function uploadPhoto(
  memoryId: string,
  photoFile: File
): Promise<string> {
  const photoExt = photoFile.name.split('.').pop() || 'jpg';
  const photoRef = ref(storage, `memories/${memoryId}/photo.${photoExt}`);

  await uploadBytes(photoRef, photoFile);
  const downloadURL = await getDownloadURL(photoRef);

  return downloadURL;
}

/**
 * Uploads creator video to Firebase Storage
 */
export async function uploadCreatorVideo(
  memoryId: string,
  videoBlob: Blob
): Promise<string> {
  const videoRef = ref(storage, `memories/${memoryId}/creator-video.webm`);

  await uploadBytes(videoRef, videoBlob);
  const downloadURL = await getDownloadURL(videoRef);

  return downloadURL;
}

/**
 * Creates a new memory document in Firestore
 */
export async function createMemoryDocument(
  memoryId: string,
  inviteId: string,
  creatorName: string,
  creatorPrompt: string,
  photoUrl: string,
  creatorVideoUrl: string
): Promise<void> {
  const memoryDoc = doc(db, 'memories', memoryId);

  await setDoc(memoryDoc, {
    inviteId,
    createdAt: serverTimestamp(),
    creatorName,
    creatorPrompt,
    creatorVideoUrl,
    photoUrl,
    status: 'pending',
    friendName: null,
    friendVideoUrl: null,
    friendSubmittedAt: null,
  });
}

/**
 * Main function to create a complete memory
 * Uploads photo and video, creates Firestore document, returns invite link
 */
export async function createMemory(
  photoFile: File,
  videoBlob: Blob,
  creatorName: string,
  creatorPrompt: string
): Promise<CreateMemoryResult> {
  // 1. Generate unique IDs
  const memoryId = crypto.randomUUID();
  const inviteId = generateInviteId();

  // 2. Upload photo to Firebase Storage
  const photoUrl = await uploadPhoto(memoryId, photoFile);

  // 3. Upload video to Firebase Storage
  const creatorVideoUrl = await uploadCreatorVideo(memoryId, videoBlob);

  // 4. Create Firestore document
  await createMemoryDocument(
    memoryId,
    inviteId,
    creatorName,
    creatorPrompt,
    photoUrl,
    creatorVideoUrl
  );

  // 5. Generate invite link
  const inviteLink = `${window.location.origin}/r/${inviteId}`;

  return { memoryId, inviteId, inviteLink };
}
