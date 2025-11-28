'use client';

import { Play, MessageSquare } from 'lucide-react';
import { MemoryThread, MAX_THREADS } from '@/types/memory';
import ThreadBubble from './ThreadBubble';
import { formatRelativeTime } from '@/lib/threadUtils';

interface ThreadRailProps {
  memoryId: string;
  threads: MemoryThread[];
  isExpanded: boolean;
  onToggle: () => void;
  onThreadClick: (thread: MemoryThread) => void;
  onAddThread: () => void;
  watchedThreadIds: string[];
  className?: string;
}

export default function ThreadRail({
  memoryId,
  threads,
  isExpanded,
  onToggle,
  onThreadClick,
  onAddThread,
  watchedThreadIds,
  className = '',
}: ThreadRailProps) {
  const hasThreads = threads.length > 0;
  const canAddMore = threads.length < MAX_THREADS;

  return (
    <div
      className={`
        fixed top-0 right-0 bottom-0
        bg-white border-l border-gray-200 shadow-lg
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-[300px]' : 'w-[60px]'}
        z-30 flex flex-col overflow-hidden
        ${className}
      `}
    >
      {!isExpanded ? (
        // COLLAPSED STATE: Vertical stack of small avatars
        <div className="flex flex-col items-center gap-4 p-3 mt-20">
          {hasThreads ? (
            <>
              {threads.map((thread) => (
                <ThreadBubble
                  key={thread.id}
                  thread={thread}
                  isWatched={watchedThreadIds.includes(thread.id)}
                  size="small"
                  onClick={() => onToggle()} // Expand on click
                />
              ))}
              {canAddMore && (
                <button
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200
                           flex items-center justify-center text-gray-600 text-2xl
                           transition-colors"
                  onClick={() => onToggle()}
                  aria-label="Expand to add story"
                >
                  +
                </button>
              )}
            </>
          ) : (
            canAddMore && (
              <button
                className="w-12 h-12 rounded-full bg-[#FF6B6B] hover:bg-[#FF5252]
                         flex items-center justify-center text-white
                         transition-colors shadow-md"
                onClick={() => onToggle()}
                aria-label="Add your story"
              >
                <MessageSquare size={20} />
              </button>
            )
          )}
        </div>
      ) : (
        // EXPANDED STATE: Full panel with header, add button, and thread list
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-900">More Stories</h3>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              aria-label="Collapse panel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>

          {/* Add Thread Button */}
          {canAddMore && (
            <div className="flex-shrink-0 p-4">
              <button
                onClick={onAddThread}
                className="w-full bg-[#FF6B6B] text-white py-3 px-4 rounded-full
                         font-semibold text-sm hover:bg-[#FF5252] transition-all shadow-md
                         hover:shadow-lg"
              >
                + Add Your Story
              </button>
            </div>
          )}

          {/* Thread List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4">
            {hasThreads ? (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => onThreadClick(thread)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg
                             hover:bg-gray-50 transition-colors group"
                  >
                    <ThreadBubble
                      thread={thread}
                      isWatched={watchedThreadIds.includes(thread.id)}
                      size="medium"
                      onClick={() => {}} // Click handled by parent button
                      asButton={false}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {thread.userId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(thread.createdAt)}
                      </p>
                    </div>
                    <Play
                      size={18}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
                    />
                  </button>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">No stories yet</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Be the first to share your perspective on this memory!
                </p>
              </div>
            )}
          </div>

          {/* Footer - Max threads message */}
          {threads.length >= MAX_THREADS && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Max stories reached ({MAX_THREADS}/{MAX_THREADS})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
