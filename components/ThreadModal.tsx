'use client';

import { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MemoryThread } from '@/types/memory';

interface ThreadModalProps {
  thread: MemoryThread | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoEnd: () => void; // Called when video ends or is manually dismissed after playback
}

export default function ThreadModal({
  thread,
  isOpen,
  onClose,
  onVideoEnd,
}: ThreadModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
      });
    }
  }, [isOpen]);

  // Handle close - mark as watched if video was played
  const handleClose = () => {
    if (hasPlayed) {
      onVideoEnd(); // Mark as watched
    }
    setHasPlayed(false); // Reset for next time
    onClose();
  };

  // Handle video end - auto-close after 1 second
  const handleVideoEnd = () => {
    onVideoEnd(); // Mark as watched
    setTimeout(() => {
      setHasPlayed(false);
      onClose();
    }, 1000);
  };

  if (!isOpen || !thread) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Content Container */}
      <div
        className="relative z-10 w-full h-full max-w-4xl max-h-[90vh]
                   flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking video
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-20
                     w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white backdrop-blur-sm
                     transition-colors"
          aria-label="Close thread video"
        >
          <X size={24} />
        </button>

        {/* User Badge */}
        <div
          className="absolute top-6 left-6 z-20
                     px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm
                     flex items-center gap-2 shadow-lg"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center
                       font-bold text-white text-sm"
            style={{ backgroundColor: thread.userColor }}
          >
            {thread.userId}
          </div>
          <span className="font-semibold text-gray-900">
            {thread.userId}'s Story
          </span>
        </div>

        {/* Video Player */}
        <video
          ref={videoRef}
          src={thread.videoUrl}
          className="w-full h-full object-contain rounded-lg shadow-2xl"
          controls
          playsInline
          onPlay={() => setHasPlayed(true)}
          onEnded={handleVideoEnd}
        />
      </div>
    </div>
  );
}
