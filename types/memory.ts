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
 *
 * Firebase Storage structure:
 *
 * /memories/{memoryId}/
 *   - photo.jpg (or .png)
 *   - creator-video.mp4 (or .webm)
 *   - friend-video.mp4 (or .webm)
 */
