'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Memory } from '@/types/memory';
import { Share2, Download, ChevronDown } from 'lucide-react';

export default function MemorySplitView() {
  const params = useParams();
  const memoryId = params.memoryId as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCreatorHeader, setShowCreatorHeader] = useState(false);
  const [showFriendHeader, setShowFriendHeader] = useState(false);
  // PIP positioning state
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const creatorVideoRef = useRef<HTMLVideoElement>(null);
  const friendVideoRef = useRef<HTMLVideoElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const memoryRef = doc(db, 'memories', memoryId);
        const memorySnap = await getDoc(memoryRef);

        if (!memorySnap.exists()) {
          setError('Memory not found.');
          setLoading(false);
          return;
        }

        const memoryData = {
          ...memorySnap.data(),
          id: memorySnap.id,
          createdAt: memorySnap.data().createdAt?.toDate(),
          friendSubmittedAt: memorySnap.data().friendSubmittedAt?.toDate(),
        } as Memory;

        if (memoryData.status !== 'completed') {
          setError('This memory is not complete yet.');
          setLoading(false);
          return;
        }

        setMemory(memoryData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching memory:', err);
        setError('Failed to load memory. Please try again.');
        setLoading(false);
      }
    };

    fetchMemory();
  }, [memoryId]);

  // Auto-play only friend's video by default (creator stays paused)
  useEffect(() => {
    if (memory && !hasAutoPlayed) {
      const timer = setTimeout(() => {
        if (friendVideoRef.current) {
          friendVideoRef.current.play().catch(() => {
            console.log('Autoplay blocked for friend video');
          });
          setIsPlaying(true);
          setHasAutoPlayed(true);
        }
        // Creator video stays paused by default
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [memory, hasAutoPlayed]);

  // Initialize PIP position to bottom-right on mount
  useEffect(() => {
    if (memory && photoContainerRef.current) {
      const container = photoContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const pipSize = getPipSize();

      const padding = window.innerWidth >= 1024 ? 32 :
                     window.innerWidth >= 768 ? 24 : 16;

      setPipPosition({
        x: containerRect.width - pipSize - padding,
        y: containerRect.height - pipSize - padding
      });
    }
  }, [memory]);

  // Global drag listeners
  useEffect(() => {
    if (isDraggingPip) {
      document.addEventListener('mousemove', handlePipMouseMove);
      document.addEventListener('mouseup', handlePipMouseUp);
      document.addEventListener('touchmove', handlePipTouchMove, { passive: false });
      document.addEventListener('touchend', handlePipTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handlePipMouseMove);
        document.removeEventListener('mouseup', handlePipMouseUp);
        document.removeEventListener('touchmove', handlePipTouchMove);
        document.removeEventListener('touchend', handlePipTouchEnd);
      };
    }
  }, [isDraggingPip, dragOffset, pipPosition]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!photoContainerRef.current) return;

      const container = photoContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const pipSize = getPipSize();

      setPipPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, containerRect.width - pipSize)),
        y: Math.max(0, Math.min(prev.y, containerRect.height - pipSize))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy link');
    }
  };

  const shareMemory = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this memory!',
          text: `${memory?.creatorName} and ${memory?.friendName || 'a friend'} created a memory together`,
          url: url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          // If share fails (not cancelled), fallback to copy
          copyLink();
        }
      }
    } else {
      // No Web Share API - use copy instead
      copyLink();
    }
  };

  const toggleSync = () => {
    setIsSynced(!isSynced);

    if (!isSynced) {
      // Entering synced mode: sync both videos
      if (creatorVideoRef.current && friendVideoRef.current) {
        const friendTime = friendVideoRef.current.currentTime;
        creatorVideoRef.current.currentTime = friendTime;

        if (isPlaying) {
          creatorVideoRef.current.play();
          friendVideoRef.current.play();
        }
      }
    } else {
      // Exiting synced mode: pause creator
      if (creatorVideoRef.current) {
        creatorVideoRef.current.pause();
      }
    }
  };

  const handlePlayPause = (video: 'creator' | 'friend') => {
    if (isSynced) {
      // Sync both videos
      if (creatorVideoRef.current && friendVideoRef.current) {
        const isCurrentlyPlaying = video === 'creator'
          ? !creatorVideoRef.current.paused
          : !friendVideoRef.current.paused;

        if (isCurrentlyPlaying) {
          creatorVideoRef.current.play();
          friendVideoRef.current.play();
        } else {
          creatorVideoRef.current.pause();
          friendVideoRef.current.pause();
        }
        setIsPlaying(isCurrentlyPlaying);
      }
    }
  };

  const handleTimeUpdate = (video: 'creator' | 'friend') => {
    if (isSynced) {
      const sourceRef = video === 'creator' ? creatorVideoRef : friendVideoRef;
      const targetRef = video === 'creator' ? friendVideoRef : creatorVideoRef;

      if (sourceRef.current && targetRef.current) {
        const timeDiff = Math.abs(sourceRef.current.currentTime - targetRef.current.currentTime);
        if (timeDiff > 0.3) {
          targetRef.current.currentTime = sourceRef.current.currentTime;
        }
      }
    }
  };

  // PIP Drag Event Handlers
  const handlePipMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!photoContainerRef.current) return;

    const containerRect = photoContainerRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - (containerRect.left + pipPosition.x),
      y: e.clientY - (containerRect.top + pipPosition.y)
    });

    setIsDraggingPip(true);
  };

  const handlePipMouseMove = (e: MouseEvent) => {
    if (!isDraggingPip || !photoContainerRef.current) return;

    const container = photoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pipSize = getPipSize();

    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    // Constrain within boundaries
    newX = Math.max(0, Math.min(newX, containerRect.width - pipSize));
    newY = Math.max(0, Math.min(newY, containerRect.height - pipSize));

    setPipPosition({ x: newX, y: newY });
  };

  const handlePipMouseUp = () => {
    setIsDraggingPip(false);

    if (!photoContainerRef.current) return;

    const container = photoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pipSize = getPipSize();
    const snapThreshold = 50;

    let newX = pipPosition.x;
    let newY = pipPosition.y;

    // Snap to left/right
    if (pipPosition.x < snapThreshold) {
      newX = 0;
    } else if (pipPosition.x > containerRect.width - pipSize - snapThreshold) {
      newX = containerRect.width - pipSize;
    }

    // Snap to top/bottom
    if (pipPosition.y < snapThreshold) {
      newY = 0;
    } else if (pipPosition.y > containerRect.height - pipSize - snapThreshold) {
      newY = containerRect.height - pipSize;
    }

    if (newX !== pipPosition.x || newY !== pipPosition.y) {
      setPipPosition({ x: newX, y: newY });
    }
  };

  const handlePipTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!photoContainerRef.current) return;

    const touch = e.touches[0];
    const containerRect = photoContainerRef.current.getBoundingClientRect();

    setDragOffset({
      x: touch.clientX - (containerRect.left + pipPosition.x),
      y: touch.clientY - (containerRect.top + pipPosition.y)
    });

    setIsDraggingPip(true);
  };

  const handlePipTouchMove = (e: TouchEvent) => {
    if (!isDraggingPip || !photoContainerRef.current) return;

    e.preventDefault();

    const touch = e.touches[0];
    const container = photoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const pipSize = getPipSize();

    let newX = touch.clientX - containerRect.left - dragOffset.x;
    let newY = touch.clientY - containerRect.top - dragOffset.y;

    newX = Math.max(0, Math.min(newX, containerRect.width - pipSize));
    newY = Math.max(0, Math.min(newY, containerRect.height - pipSize));

    setPipPosition({ x: newX, y: newY });
  };

  const handlePipTouchEnd = () => {
    handlePipMouseUp();
  };

  // Helper function for responsive PIP sizing
  const getPipSize = () => {
    const width = window.innerWidth;
    if (width >= 1024) return 176; // lg: 44 * 4
    if (width >= 768) return 144;  // md: 36 * 4
    if (width >= 640) return 112;  // sm: 28 * 4
    return 80;                     // mobile: 20 * 4
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-gray-900 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Oops!</h1>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FF5252] transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Project Memory</p>
            <h1 className="text-2xl font-bold text-gray-900">{memory.creatorPrompt}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync Toggle Button */}
            <button
              onClick={toggleSync}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isSynced
                  ? 'bg-[#FF6B6B] text-white shadow-md hover:bg-[#FF5252]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={isSynced ? 'text-white' : 'text-gray-600'}
              >
                <path
                  d="M14 4.5V7.5H11M2 11.5V8.5H5M13.5 7.5C13.0717 5.77609 11.9772 4.29129 10.4615 3.34983C8.94585 2.40837 7.12851 2.08546 5.38069 2.44931C3.63287 2.81317 2.08679 3.8384 1.06339 5.3247C0.0399826 6.81099 -0.28797 8.64686 0.209059 10.3675M2.5 11.5C2.92833 13.2239 4.02278 14.7087 5.53845 15.6502C7.05413 16.5916 8.87147 16.9145 10.6193 16.5507C12.3671 16.1868 13.9132 15.1616 14.9366 13.6753C15.96 12.189 16.288 10.3531 15.7609 8.6325"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSynced ? 'Synced' : 'Sync Videos'}
            </button>

            {/* Copy Link Button */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copySuccess ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={shareMemory}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold transition-all text-gray-700"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Split View Container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side (Desktop) / Top (Mobile): Creator + Photo */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Column Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200">
            {/* Mobile: Collapsible with toggle button */}
            <button
              onClick={() => setShowCreatorHeader(!showCreatorHeader)}
              className="md:hidden w-full px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors active:bg-gray-100"
              aria-label="Toggle creator section header"
            >
              <span>Section Info</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showCreatorHeader ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Mobile: Expandable header content */}
            <div className={`md:hidden overflow-hidden transition-all duration-200 ${showCreatorHeader ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{memory.creatorName}'s Prompt</p>
              </div>
            </div>

            {/* Desktop: Always visible */}
            <div className="hidden md:block px-6 py-3">
              <p className="text-sm font-semibold text-gray-700">{memory.creatorName}'s Prompt</p>
            </div>
          </div>

          {/* Photo Container with Blurred Backdrop */}
          <div
            ref={photoContainerRef}
            className="flex-1 relative flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-visible"
          >
            {/* Background Layer: Blurred backdrop to fill empty space */}
            <div className="absolute inset-0">
              <img
                src={memory.photoUrl}
                alt="Background"
                className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
              />
            </div>

            {/* Foreground Layer: Actual photo with full visibility */}
            <img
              src={memory.photoUrl}
              alt="Memory"
              className="relative max-w-full max-h-full object-contain z-10"
            />

            {/* Creator Video PiP (Draggable) */}
            <div
              className="absolute w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black z-20"
              style={{
                left: `${pipPosition.x}px`,
                top: `${pipPosition.y}px`,
                cursor: isDraggingPip ? 'grabbing' : 'grab',
                transition: isDraggingPip ? 'none' : 'left 200ms ease-out, top 200ms ease-out'
              }}
              onMouseDown={handlePipMouseDown}
              onTouchStart={handlePipTouchStart}
            >
              <video
                ref={creatorVideoRef}
                src={memory.creatorVideoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                controls
                onPlay={() => handlePlayPause('creator')}
                onPause={() => handlePlayPause('creator')}
                onTimeUpdate={() => handleTimeUpdate('creator')}
              />
            </div>

            {/* Sync Badge */}
            {isSynced && (
              <div className="absolute top-4 right-4 bg-[#FF6B6B]/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-30">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-xs font-bold text-white">Videos Synced</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side (Desktop) / Bottom (Mobile): Friend Response */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden md:border-l border-gray-200">
          {/* Column Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200">
            {/* Mobile: Collapsible with toggle button */}
            <button
              onClick={() => setShowFriendHeader(!showFriendHeader)}
              className="md:hidden w-full px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors active:bg-gray-100"
              aria-label="Toggle friend section header"
            >
              <span>Section Info</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showFriendHeader ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Mobile: Expandable header content */}
            <div className={`md:hidden overflow-hidden transition-all duration-200 ${showFriendHeader ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {memory.friendName ? `${memory.friendName}'s Response` : 'Friend\'s Response'}
                </p>
              </div>
            </div>

            {/* Desktop: Always visible */}
            <div className="hidden md:block px-6 py-3">
              <p className="text-sm font-semibold text-gray-700">
                {memory.friendName ? `${memory.friendName}'s Response` : 'Friend\'s Response'}
              </p>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gray-100">
            <video
              ref={friendVideoRef}
              src={memory.friendVideoUrl}
              className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
              controls
              playsInline
              onPlay={() => handlePlayPause('friend')}
              onPause={() => handlePlayPause('friend')}
              onTimeUpdate={() => handleTimeUpdate('friend')}
            />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 py-2">
        <div className="px-4 md:px-6 text-center">
          <p className="text-xs text-gray-500">
            Created with <span className="text-red-400">♥</span> by Project Memory
            {memory.friendSubmittedAt && (
              <span className="ml-2">
                · {new Date(memory.friendSubmittedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
