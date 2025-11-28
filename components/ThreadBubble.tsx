import { MemoryThread } from '@/types/memory';

interface ThreadBubbleProps {
  thread: MemoryThread;
  isWatched: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
  showLabel?: boolean;
  asButton?: boolean; // If false, renders as div (for use inside other buttons)
}

export default function ThreadBubble({
  thread,
  isWatched,
  size = 'medium',
  onClick,
  showLabel = false,
  asButton = true,
}: ThreadBubbleProps) {
  // Size mappings for container
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  // Text size for user ID label
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const content = (
    <>
      {/* Outer Ring - Shows thread color if unwatched, gray if watched */}
      <div
        className={`
          ${sizeClasses[size]} rounded-full p-[3px]
          transition-all duration-200
          ${isWatched ? 'bg-gray-300' : ''}
        `}
        style={{
          backgroundColor: isWatched ? undefined : thread.userColor,
        }}
      >
        {/* Inner Circle - White background with user ID */}
        <div
          className={`
            w-full h-full rounded-full bg-white
            flex items-center justify-center
            font-bold text-gray-900
            ${textSizeClasses[size]}
          `}
        >
          {thread.userId}
        </div>
      </div>

      {/* Optional Label Below Avatar */}
      {showLabel && (
        <span className="text-xs text-gray-600 font-medium">
          {thread.userId}
        </span>
      )}

      {/* Unwatched Indicator Dot */}
      {!isWatched && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF6B6B] border-2 border-white shadow-sm" />
      )}
    </>
  );

  if (asButton) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 transition-transform hover:scale-105"
        aria-label={`${isWatched ? 'Watched' : 'Unwatched'} video from ${thread.userId}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {content}
    </div>
  );
}
