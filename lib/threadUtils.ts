import { MemoryThread, THREAD_COLORS, MAX_THREADS, Memory, PlaylistItem } from '@/types/memory';

/**
 * Assign user ID and color to a new thread based on existing threads
 * @param existingThreads - Array of existing threads
 * @returns Object with userId (e.g., "U1") and color (hex)
 */
export function assignThreadColor(existingThreads: MemoryThread[]): {
  userId: string;
  color: string;
} {
  const threadNumber = existingThreads.length + 1;
  const userId = `U${threadNumber}`;

  // Find first available color that hasn't been used
  const usedColors = new Set(existingThreads.map(t => t.userColor));
  const availableColor = THREAD_COLORS.find(color => !usedColors.has(color));

  return {
    userId,
    color: availableColor || THREAD_COLORS[0] // Fallback to first color (shouldn't happen with 5 max threads)
  };
}

/**
 * Get watched thread IDs from localStorage
 * @param memoryId - Memory ID to look up watched threads for
 * @returns Array of watched thread IDs
 */
export function getWatchedThreads(memoryId: string): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = `memory-${memoryId}-watched-threads`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get watched threads:', error);
    return [];
  }
}

/**
 * Mark a thread as watched in localStorage
 * @param memoryId - Memory ID
 * @param threadId - Thread ID to mark as watched
 */
export function markThreadAsWatched(memoryId: string, threadId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const watched = getWatchedThreads(memoryId);
    if (!watched.includes(threadId)) {
      watched.push(threadId);
      const key = `memory-${memoryId}-watched-threads`;
      localStorage.setItem(key, JSON.stringify(watched));
    }
  } catch (error) {
    console.error('Failed to save watch state:', error);
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3d ago")
 * @param date - Date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Check if a new thread can be added (under MAX_THREADS limit)
 * @param threads - Array of existing threads
 * @returns True if thread can be added, false if at max
 */
export function canAddThread(threads: MemoryThread[]): boolean {
  return threads.length < MAX_THREADS;
}

/**
 * Create a unified playlist from friend video + threads
 * Friend video becomes Track 1 (pinned), threads follow in chronological order
 * @param memory - Memory object
 * @param watchedThreadIds - Array of watched thread IDs
 * @returns Array of playlist items
 */
export function createPlaylist(
  memory: Memory,
  watchedThreadIds: string[]
): PlaylistItem[] {
  const items: PlaylistItem[] = [];

  // Item 1: Friend video (if exists and memory is completed)
  if (memory.friendVideoUrl && memory.status === 'completed') {
    items.push({
      id: 'friend',
      type: 'friend',
      videoUrl: memory.friendVideoUrl,
      label: 'Main Story',
      createdAt: memory.friendSubmittedAt || memory.createdAt,
    });
  }

  // Items 2+: Thread videos (sorted by creation time)
  const threads = memory.threads || [];
  threads.forEach((thread) => {
    items.push({
      id: thread.id,
      type: 'thread',
      videoUrl: thread.videoUrl,
      label: thread.userId,
      createdAt: thread.createdAt,
      userId: thread.userId,
      userColor: thread.userColor,
      isWatched: watchedThreadIds.includes(thread.id),
    });
  });

  return items;
}

/**
 * Get the next item in playlist with circular navigation
 * @param playlist - Array of playlist items
 * @param currentIndex - Current playlist index
 * @param circular - Enable circular navigation (default true)
 * @returns Next playlist item or null
 */
export function getNextItem(
  playlist: PlaylistItem[],
  currentIndex: number,
  circular: boolean = true
): PlaylistItem | null {
  if (playlist.length === 0) return null;

  const nextIndex = currentIndex + 1;
  if (nextIndex >= playlist.length) {
    return circular ? playlist[0] : null;
  }
  return playlist[nextIndex];
}

/**
 * Get the previous item in playlist with circular navigation
 * @param playlist - Array of playlist items
 * @param currentIndex - Current playlist index
 * @param circular - Enable circular navigation (default true)
 * @returns Previous playlist item or null
 */
export function getPrevItem(
  playlist: PlaylistItem[],
  currentIndex: number,
  circular: boolean = true
): PlaylistItem | null {
  if (playlist.length === 0) return null;

  const prevIndex = currentIndex - 1;
  if (prevIndex < 0) {
    return circular ? playlist[playlist.length - 1] : null;
  }
  return playlist[prevIndex];
}

/**
 * Extract video thumbnail from first frame using canvas
 * Caches result in localStorage for performance
 * @param videoUrl - URL of the video
 * @param cacheKey - Unique key for localStorage cache
 * @returns Promise resolving to data URL of thumbnail, or null on error
 */
export async function extractVideoThumbnail(
  videoUrl: string,
  cacheKey: string
): Promise<string | null> {
  // Check localStorage cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`thumbnail-${cacheKey}`);
      if (cached) return cached;
    } catch (e) {
      // localStorage might be disabled, continue without cache
    }
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    // Note: crossOrigin removed - Firebase Storage doesn't require it for same-origin access
    video.src = videoUrl;
    video.muted = true; // Muted to avoid audio issues
    video.playsInline = true; // Prevent fullscreen on iOS

    video.addEventListener('loadeddata', () => {
      // Seek to 0.1s to get past any initial black frames
      video.currentTime = 0.1;
    });

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, 100, 100);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          // Cache to localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`thumbnail-${cacheKey}`, dataUrl);
            } catch (e) {
              console.warn('Failed to cache thumbnail:', e);
            }
          }

          resolve(dataUrl);
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error('Failed to extract thumbnail:', err);
        resolve(null);
      }
    });

    video.addEventListener('error', (e) => {
      const errorDetails = {
        url: videoUrl,
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
      };
      console.warn('Failed to load video for thumbnail extraction:', errorDetails);
      resolve(null);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(null);
    }, 5000);
  });
}
