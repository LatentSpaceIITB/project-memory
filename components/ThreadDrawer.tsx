'use client';

import { Play, MessageSquare } from 'lucide-react';
import { MemoryThread, MAX_THREADS } from '@/types/memory';
import ThreadBubble from './ThreadBubble';
import { formatRelativeTime } from '@/lib/threadUtils';

interface ThreadDrawerProps {
  memoryId: string;
  threads: MemoryThread[];
  isOpen: boolean;
  onClose: () => void;
  onThreadClick: (thread: MemoryThread) => void;
  onAddThread: () => void;
  watchedThreadIds: string[];
}

export default function ThreadDrawer({
  memoryId,
  threads,
  isOpen,
  onClose,
  onThreadClick,
  onAddThread,
  watchedThreadIds,
}: ThreadDrawerProps) {
  const hasThreads = threads.length > 0;
  const canAddMore = threads.length < MAX_THREADS;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white rounded-t-3xl shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[70vh] md:hidden
          flex flex-col
        `}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-4 pb-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg">More Stories</h3>
          {hasThreads && (
            <p className="text-sm text-gray-500 mt-0.5">
              {threads.length} {threads.length === 1 ? 'story' : 'stories'} added
            </p>
          )}
        </div>

        {/* Add Thread Button */}
        {canAddMore && (
          <div className="flex-shrink-0 p-4">
            <button
              onClick={onAddThread}
              className="w-full bg-[#FF6B6B] text-white py-3 px-4 rounded-full
                       font-semibold hover:bg-[#FF5252] transition-all shadow-md"
            >
              + Add Your Story
            </button>
          </div>
        )}

        {/* Thread List or Empty State */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-safe"
          style={{ maxHeight: 'calc(70vh - 180px)' }}
        >
          {hasThreads ? (
            <div className="space-y-2 pb-4">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onThreadClick(thread)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg
                           hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <ThreadBubble
                    thread={thread}
                    isWatched={watchedThreadIds.includes(thread.id)}
                    size="medium"
                    onClick={() => {}} // Click handled by parent button
                    asButton={false}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-900">
                      {thread.userId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(thread.createdAt)}
                    </p>
                  </div>
                  <Play size={20} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No stories yet</h4>
              <p className="text-sm text-gray-600">
                Be the first to add yours!
              </p>
            </div>
          )}
        </div>

        {/* Footer - Max threads message */}
        {threads.length >= MAX_THREADS && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 text-center bg-gray-50">
            <p className="text-xs text-gray-500 font-medium">
              Maximum stories reached ({MAX_THREADS}/{MAX_THREADS})
            </p>
          </div>
        )}
      </div>
    </>
  );
}
