'use client';

import { Play, MessageSquare } from 'lucide-react';
import { PlaylistItem, MAX_THREADS } from '@/types/memory';
import { formatRelativeTime } from '@/lib/threadUtils';

interface ThreadDrawerProps {
  memoryId: string;
  playlist: PlaylistItem[];
  activeItemId: string | null;
  thumbnails: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: PlaylistItem, index: number) => void;
  onAddThread: () => void;
  threadCount: number; // Current number of threads (for MAX_THREADS check)
}

export default function ThreadDrawer({
  memoryId,
  playlist,
  activeItemId,
  thumbnails,
  isOpen,
  onClose,
  onItemClick,
  onAddThread,
  threadCount,
}: ThreadDrawerProps) {
  const hasItems = playlist.length > 0;
  const canAddMore = threadCount < MAX_THREADS;

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
          <h3 className="font-bold text-gray-900 text-lg">Playlist</h3>
          {hasItems && (
            <p className="text-sm text-gray-500 mt-0.5">
              {playlist.length} {playlist.length === 1 ? 'video' : 'videos'}
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

        {/* Playlist or Empty State */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-safe"
          style={{ maxHeight: 'calc(70vh - 180px)' }}
        >
          {hasItems ? (
            <div className="space-y-2 pb-4">
              {playlist.map((item, index) => {
                const isActive = item.id === activeItemId;
                const thumbnail = thumbnails[item.id];

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onItemClick(item, index);
                      // Auto-close drawer after selection (mobile behavior)
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg
                      transition-all
                      ${isActive
                        ? 'bg-[#FFF5F5] ring-2 ring-[#FF6B6B] shadow-sm'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                      }
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Play size={20} className="text-gray-400" />
                        </div>
                      )}

                      {/* Unwatch indicator for threads */}
                      {item.type === 'thread' && !item.isWatched && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full border border-white" />
                      )}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 text-left min-w-0">
                      <p className={`font-semibold ${isActive ? 'text-[#FF6B6B]' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>

                    {/* Play icon */}
                    <Play
                      size={20}
                      className={`flex-shrink-0 ${
                        isActive ? 'text-[#FF6B6B]' : 'text-gray-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No videos yet</h4>
              <p className="text-sm text-gray-600">
                Be the first to add yours!
              </p>
            </div>
          )}
        </div>

        {/* Footer - Max threads message */}
        {threadCount >= MAX_THREADS && (
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
