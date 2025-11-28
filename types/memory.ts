/**
 * Represents a thread (audience member's video response)
 */
export interface MemoryThread {
  id: string;              // Unique thread ID (nanoid)
  userId: string;          // Auto-generated user ID ("U1", "U2", etc.)
  userColor: string;       // Hex color from THREAD_COLORS palette
  videoUrl: string;        // Firebase Storage URL
  createdAt: Date;
}

/**
 * Playlist item representing any playable video (friend or thread)
 * Used for unified video navigation system
 */
export interface PlaylistItem {
  id: string;              // "friend" for friend video, or thread ID
  type: 'friend' | 'thread';
  videoUrl: string;
  thumbnailUrl?: string;   // Canvas-extracted or cached
  label: string;           // "Main Story" for friend, or userId for threads
  createdAt: Date;

  // Thread-specific fields (undefined for friend)
  userId?: string;
  userColor?: string;
  isWatched?: boolean;
}

/**
 * Active video type for tracking which video is currently playing
 */
export type ActiveVideoType = 'friend' | 'creator' | 'thread';

/**
 * State object for tracking the currently active/playing video
 */
export interface ActiveVideoState {
  type: ActiveVideoType;
  threadId?: string;       // Only set if type === 'thread'
  playlistIndex?: number;  // Position in playlist array
}

/**
 * Represents a single memory (photo + 2 videos)
 */
export interface Memory {
  id: string;
  inviteId: string; // Unique ID for the friend response page (/r/{inviteId})
  createdAt: Date;

  // Creator data
  creatorName: string;
  creatorPrompt: string; // The question asked
  creatorVideoUrl: string; // URL to creator's video in Firebase Storage
  photoUrl: string; // URL to the photo in Firebase Storage

  // Friend response data (filled after friend submits)
  friendName?: string;
  friendVideoUrl?: string; // URL to friend's video
  friendSubmittedAt?: Date;

  // Metadata
  status: 'pending' | 'completed'; // pending = waiting for friend, completed = friend has responded

  // Memory Threads (additional video responses from audience)
  threads?: MemoryThread[];
  threadCount?: number; // Denormalized count for quick validation
}

/**
 * Recording state for the friend response page
 */
export type RecordingState =
  | 'initial'      // Showing creator's prompt
  | 'preparing'    // Requesting camera permission
  | 'ready'        // Camera preview visible, ready to record
  | 'recording'    // Recording in progress
  | 'reviewing'    // Playing back friend's recording
  | 'uploading'    // Submitting response
  | 'complete';    // Redirecting to split view

/**
 * Creator upload page state machine
 */
export type CreatorState =
  | 'photo-upload'    // Upload photo step
  | 'photo-preview'   // Preview photo and enter details
  | 'video-preparing' // Requesting camera permission
  | 'video-ready'     // Camera preview visible, ready to record
  | 'video-recording' // Recording in progress
  | 'video-reviewing' // Playing back creator's recording
  | 'uploading'       // Uploading to Firebase
  | 'success';        // Show shareable link

/**
 * Creator form data
 */
export interface CreatorFormData {
  photoFile: File | null;
  photoPreviewUrl: string | null;
  creatorName: string;
  creatorPrompt: string;
  videoBlob: Blob | null;
}

/**
 * Color palette for thread user avatars (assigned in order)
 */
export const THREAD_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#6BCF7F', // Green
  '#A78BFA', // Purple
] as const;

/**
 * Maximum number of threads allowed per memory
 */
export const MAX_THREADS = 5;

/**
 * Firestore collection structure:
 *
 * /memories/{memoryId}
 *   - id: string (same as document ID)
 *   - inviteId: string (for /r/{inviteId} route)
 *   - createdAt: timestamp
 *   - creatorName: string
 *   - creatorPrompt: string
 *   - creatorVideoUrl: string
 *   - photoUrl: string
 *   - friendName: string | null
 *   - friendVideoUrl: string | null
 *   - friendSubmittedAt: timestamp | null
 *   - status: 'pending' | 'completed'
 *   - threads: array | null (MemoryThread[], max 5)
 *   - threadCount: number | null (0-5)
 *
 * Firebase Storage structure:
 *
 * /memories/{memoryId}/
 *   - photo.jpg (or .png)
 *   - creator-video.webm (or .mp4)
 *   - friend-video.webm (or .mp4)
 *   - thread-{threadId}-{timestamp}.webm
 */
