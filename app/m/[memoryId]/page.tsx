'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Memory, MemoryThread, MAX_THREADS, PlaylistItem, ActiveVideoState } from '@/types/memory';
import { Share2, Copy, Check, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getWatchedThreads,
  markThreadAsWatched,
  createPlaylist,
  getNextItem,
  getPrevItem,
  extractVideoThumbnail
} from '@/lib/threadUtils';
import ThreadRail from '@/components/ThreadRail';
import ThreadDrawer from '@/components/ThreadDrawer';
import ThreadRecordingInterface from '@/components/ThreadRecordingInterface';

export default function MemorySplitView() {
  const params = useParams();
  const memoryId = params.memoryId as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // PIP positioning state
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  // Creator video playback state
  const [isCreatorPlaying, setIsCreatorPlaying] = useState(false);

  // Thread state management
  const [threads, setThreads] = useState<MemoryThread[]>([]);
  const [watchedThreadIds, setWatchedThreadIds] = useState<string[]>([]);
  const [isThreadRailExpanded, setIsThreadRailExpanded] = useState(false);
  const [isThreadDrawerOpen, setIsThreadDrawerOpen] = useState(false);
  const [isRecordingThread, setIsRecordingThread] = useState(false);

  // Playlist state (replaces ThreadModal)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [activeVideoState, setActiveVideoState] = useState<ActiveVideoState>({
    type: 'friend',
    playlistIndex: 0,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});

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

  // Load threads and watch state when memory loads
  useEffect(() => {
    if (memory) {
      setThreads(memory.threads || []);
      setWatchedThreadIds(getWatchedThreads(memoryId));
    }
  }, [memory, memoryId]);

  // Initialize playlist when memory or threads change
  useEffect(() => {
    if (memory) {
      const newPlaylist = createPlaylist(memory, watchedThreadIds);
      setPlaylist(newPlaylist);

      // Extract thumbnails in background (async)
      newPlaylist.forEach(async (item) => {
        const thumb = await extractVideoThumbnail(item.videoUrl, item.id);
        if (thumb) {
          setVideoThumbnails(prev => ({ ...prev, [item.id]: thumb }));
        }
      });
    }
  }, [memory, threads, watchedThreadIds]);

  // Real-time updates for threads
  useEffect(() => {
    if (!memoryId) return;

    const memoryRef = doc(db, 'memories', memoryId);
    const unsubscribe = onSnapshot(memoryRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.threads) {
        setThreads(
          data.threads.map((t: any) => ({
            ...t,
            createdAt: t.createdAt?.toDate() || new Date(),
          }))
        );
      }
    });

    return () => unsubscribe();
  }, [memoryId]);

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

  // Video switching handler (replaces handleThreadClick)
  const switchToVideo = (item: PlaylistItem, index: number) => {
    if (activeVideoState.playlistIndex === index) return; // Already playing

    setIsTransitioning(true);

    // Pause all other videos
    if (creatorVideoRef.current && !creatorVideoRef.current.paused) {
      creatorVideoRef.current.pause();
      setIsCreatorPlaying(false);
    }

    if (friendVideoRef.current) {
      friendVideoRef.current.pause();
      setIsPlaying(false);
    }

    // Update active state
    setActiveVideoState({
      type: item.type === 'friend' ? 'friend' : 'thread',
      threadId: item.type === 'thread' ? item.id : undefined,
      playlistIndex: index,
    });

    // Switch video source with crossfade
    setTimeout(() => {
      if (friendVideoRef.current) {
        friendVideoRef.current.src = item.videoUrl;
        friendVideoRef.current.load();
        friendVideoRef.current.play()
          .then(() => {
            setIsTransitioning(false);
          })
          .catch(err => {
            console.error('Video play failed:', err);
            setIsTransitioning(false);
          });
      } else {
        setIsTransitioning(false);
      }
    }, 150); // Half of crossfade duration

    // Mark as watched if it's a thread
    if (item.type === 'thread') {
      markThreadAsWatched(memoryId, item.id);
      setWatchedThreadIds(prev => [...new Set([...prev, item.id])]);
    }
  };

  const handleAddThread = () => {
    if (threads.length >= MAX_THREADS) {
      alert(`Maximum of ${MAX_THREADS} threads reached.`);
      return;
    }
    setIsRecordingThread(true);
  };

  const handleThreadComplete = (newThread: MemoryThread) => {
    setThreads([...threads, newThread]);
    setIsRecordingThread(false);
  };

  // Navigation controls
  const goToNext = () => {
    const next = getNextItem(playlist, activeVideoState.playlistIndex || 0);
    if (next) {
      const nextIndex = playlist.findIndex(p => p.id === next.id);
      switchToVideo(next, nextIndex);
    }
  };

  const goToPrev = () => {
    const prev = getPrevItem(playlist, activeVideoState.playlistIndex || 0);
    if (prev) {
      const prevIndex = playlist.findIndex(p => p.id === prev.id);
      switchToVideo(prev, prevIndex);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playlist, activeVideoState]);

  // Toggle creator video play/pause
  const toggleCreatorVideo = () => {
    if (creatorVideoRef.current) {
      if (isCreatorPlaying) {
        creatorVideoRef.current.pause();
        setIsCreatorPlaying(false);
      } else {
        // Pause friend video before playing creator video
        if (friendVideoRef.current && !friendVideoRef.current.paused) {
          friendVideoRef.current.pause();
          setIsPlaying(false);
        }
        // Handle promise from play() for better mobile support
        const playPromise = creatorVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsCreatorPlaying(true);
            })
            .catch((err) => {
              console.error('Creator video play error:', err);
              // Video play was prevented, user may need to interact first
            });
        } else {
          setIsCreatorPlaying(true);
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

    // Record start position for click detection
    setDragStartPos({ x: e.clientX, y: e.clientY });

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

  const handlePipMouseUp = (e: MouseEvent) => {
    setIsDraggingPip(false);

    // Detect click vs drag (click = movement < 5px)
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) +
      Math.pow(e.clientY - dragStartPos.y, 2)
    );

    if (dragDistance < 5) {
      // It's a click, toggle video
      toggleCreatorVideo();
      return;
    }

    // It's a drag, apply snap logic
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
    // Don't prevent default immediately - let video handle taps
    // Only prevent scrolling, not all touch events
    e.stopPropagation();

    if (!photoContainerRef.current) return;

    const touch = e.touches[0];
    const containerRect = photoContainerRef.current.getBoundingClientRect();

    // Record start position for click detection
    setDragStartPos({ x: touch.clientX, y: touch.clientY });

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

  const handlePipTouchEnd = (e: TouchEvent) => {
    setIsDraggingPip(false);

    const touch = e.changedTouches[0];

    // Detect tap vs drag (tap = movement < 5px)
    const dragDistance = Math.sqrt(
      Math.pow(touch.clientX - dragStartPos.x, 2) +
      Math.pow(touch.clientY - dragStartPos.y, 2)
    );

    if (dragDistance < 5) {
      // It's a tap, toggle video
      toggleCreatorVideo();
      return;
    }

    // It's a drag, apply snap logic
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
    <div className="min-h-screen md:h-screen overflow-auto md:overflow-hidden bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Project Memory</p>
            <div>
              {/* Desktop: Full personalized prompt */}
              <h1 className="hidden md:block text-2xl font-bold text-gray-900">
                {memory.creatorName} asks: {memory.creatorPrompt}
              </h1>

              {/* Mobile: Condensed personalized title */}
              <h1 className="md:hidden text-lg font-bold text-gray-900">
                {memory.creatorName}'s Question
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Link button */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                copySuccess
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Copy link to clipboard"
            >
              {copySuccess ? (
                <>
                  <Check size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* Share button */}
            <button
              onClick={shareMemory}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Share this memory"
            >
              <Share2 size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Split View Container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-visible md:overflow-hidden">
        {/* Left Side (Desktop) / Top (Mobile): Creator + Photo */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Photo Container with Blurred Backdrop */}
          <div
            ref={photoContainerRef}
            className="relative flex items-center justify-center p-3 sm:p-4 md:flex-1 md:p-6 overflow-visible min-h-[400px] md:min-h-0"
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
              className="absolute w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black z-20"
              style={{
                left: `${pipPosition.x}px`,
                top: `${pipPosition.y}px`,
                cursor: isDraggingPip ? 'grabbing' : 'grab',
                transition: isDraggingPip ? 'none' : 'left 200ms ease-out, top 200ms ease-out',
                touchAction: 'manipulation' // Allow taps for video playback
              }}
              onMouseDown={handlePipMouseDown}
              onTouchStart={handlePipTouchStart}
            >
              <video
                ref={creatorVideoRef}
                src={memory.creatorVideoUrl}
                className="w-full h-full object-cover"
                playsInline
                onPlay={() => setIsCreatorPlaying(true)}
                onPause={() => setIsCreatorPlaying(false)}
                onEnded={() => setIsCreatorPlaying(false)}
              />
            </div>
          </div>
        </div>

        {/* Right Side (Desktop) / Bottom (Mobile): Friend/Thread Video Player */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden md:border-l border-gray-200">
          {/* Video Container with Playlist Support */}
          <div className="relative flex items-center justify-center p-3 sm:p-4 md:flex-1 md:p-6 bg-gray-100 min-h-[300px] md:min-h-0">
            {/* Crossfade overlay during transitions */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-gray-100 z-10 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
              </div>
            )}

            {/* Video Player */}
            <video
              ref={friendVideoRef}
              src={playlist[activeVideoState.playlistIndex || 0]?.videoUrl || memory.friendVideoUrl}
              className={`max-w-full max-h-full object-contain shadow-xl rounded-lg transition-opacity duration-300 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
              controls
              playsInline
              onPlay={() => {
                // Pause creator video when friend/thread video plays
                if (creatorVideoRef.current && !creatorVideoRef.current.paused) {
                  creatorVideoRef.current.pause();
                  setIsCreatorPlaying(false);
                }
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
            />

            {/* Mobile Navigation Controls (only show if multiple videos) */}
            {playlist.length > 1 && (
              <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
                <button
                  onClick={goToPrev}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                  aria-label="Previous video"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
                  aria-label="Next video"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Video Info Overlay */}
            {playlist.length > 0 && (
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <p className="text-sm font-semibold text-gray-900">
                  {playlist[activeVideoState.playlistIndex || 0]?.label || 'Main Story'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Thread Rail */}
        {memory.status === 'completed' && (playlist.length > 0 || threads.length < MAX_THREADS) && (
          <ThreadRail
            memoryId={memoryId}
            playlist={playlist}
            activeItemId={playlist[activeVideoState.playlistIndex || 0]?.id || null}
            thumbnails={videoThumbnails}
            isExpanded={isThreadRailExpanded}
            onToggle={() => setIsThreadRailExpanded(!isThreadRailExpanded)}
            onItemClick={(item, index) => switchToVideo(item, index)}
            onAddThread={handleAddThread}
            threadCount={threads.length}
            className="hidden md:block"
          />
        )}

        {/* Mobile Drawer Trigger Button */}
        {memory.status === 'completed' && (threads.length > 0 || threads.length < MAX_THREADS) && (
          <div className="md:hidden fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setIsThreadDrawerOpen(true)}
              className="bg-[#FF6B6B] text-white rounded-full p-4 shadow-2xl hover:bg-[#FF5252] transition-all relative"
              aria-label="View more stories"
            >
              <MessageSquare size={24} />
              {threads.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#FF6B6B]
                               rounded-full w-6 h-6 flex items-center justify-center
                               text-xs font-bold shadow-md">
                  {threads.length}
                </span>
              )}
            </button>
          </div>
        )}
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

      {/* Mobile Drawer */}
      <ThreadDrawer
        memoryId={memoryId}
        playlist={playlist}
        activeItemId={playlist[activeVideoState.playlistIndex || 0]?.id || null}
        thumbnails={videoThumbnails}
        isOpen={isThreadDrawerOpen}
        onClose={() => setIsThreadDrawerOpen(false)}
        onItemClick={(item, index) => switchToVideo(item, index)}
        onAddThread={handleAddThread}
        threadCount={threads.length}
      />

      {/* ThreadModal removed - videos now play in main player */}

      {/* Thread Recording Interface */}
      {isRecordingThread && (
        <ThreadRecordingInterface
          memoryId={memoryId}
          memory={memory}
          onComplete={handleThreadComplete}
          onCancel={() => setIsRecordingThread(false)}
        />
      )}
    </div>
  );
}
