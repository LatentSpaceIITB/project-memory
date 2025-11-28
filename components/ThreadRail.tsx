'use client';

import { Play, MessageSquare } from 'lucide-react';
import { PlaylistItem, MAX_THREADS } from '@/types/memory';
import { formatRelativeTime } from '@/lib/threadUtils';

interface ThreadRailProps {
  memoryId: string;
  playlist: PlaylistItem[];
  activeItemId: string | null;
  thumbnails: Record<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: PlaylistItem, index: number) => void;
  onAddThread: () => void;
  threadCount: number; // Current number of threads (for MAX_THREADS check)
  className?: string;
}

export default function ThreadRail({
  memoryId,
  playlist,
  activeItemId,
  thumbnails,
  isExpanded,
  onToggle,
  onItemClick,
  onAddThread,
  threadCount,
  className = '',
}: ThreadRailProps) {
  const hasItems = playlist.length > 0;
  const canAddMore = threadCount < MAX_THREADS;

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
        // COLLAPSED STATE: Vertical stack of video thumbnails with active growth animation
        <div className="flex flex-col items-center gap-4 p-3 mt-20">
          {hasItems ? (
            <>
              {playlist.map((item, index) => {
                const isActive = item.id === activeItemId;
                const thumbnail = thumbnails[item.id];

                return (
                  <button
                    key={item.id}
                    onClick={() => onItemClick(item, index)}
                    className={`
                      relative rounded-full overflow-hidden flex-shrink-0
                      transition-all duration-300 ease-out
                      ${isActive ? 'w-[60px] h-[60px] ring-4 ring-[#FF6B6B]' : 'w-[40px] h-[40px] ring-2 ring-gray-200 hover:ring-gray-300'}
                    `}
                    aria-label={`Play ${item.label}`}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Play size={isActive ? 24 : 16} className="text-gray-400" />
                      </div>
                    )}

                    {/* "MAIN" badge for friend video */}
                    {item.type === 'friend' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5">
                        MAIN
                      </div>
                    )}

                    {/* Unwatch indicator for threads */}
                    {item.type === 'thread' && !item.isWatched && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full border border-white" />
                    )}
                  </button>
                );
              })}

              {canAddMore && (
                <button
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200
                           flex items-center justify-center text-gray-600 text-xl
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
        // EXPANDED STATE: Full panel with header, add button, and playlist
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-900">Playlist</h3>
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

          {/* Playlist or Empty State */}
          <div className="flex-1 overflow-y-auto p-4">
            {hasItems ? (
              <div className="space-y-2">
                {playlist.map((item, index) => {
                  const isActive = item.id === activeItemId;
                  const thumbnail = thumbnails[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item, index)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg
                        transition-all group
                        ${isActive
                          ? 'bg-[#FFF5F5] ring-2 ring-[#FF6B6B] shadow-sm'
                          : 'hover:bg-gray-50'
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
                        <p className={`font-semibold truncate ${isActive ? 'text-[#FF6B6B]' : 'text-gray-900'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>

                      {/* Play icon */}
                      <Play
                        size={18}
                        className={`transition-colors flex-shrink-0 ${
                          isActive ? 'text-[#FF6B6B]' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
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
          {threadCount >= MAX_THREADS && (
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
