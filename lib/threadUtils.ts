import { MemoryThread, THREAD_COLORS, MAX_THREADS } from '@/types/memory';

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
