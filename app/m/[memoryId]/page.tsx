'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Memory } from '@/types/memory';
import { Share2, Download } from 'lucide-react';

export default function MemorySplitView() {
  const params = useParams();
  const memoryId = params.memoryId as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const creatorVideoRef = useRef<HTMLVideoElement>(null);
  const friendVideoRef = useRef<HTMLVideoElement>(null);

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
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
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
        <div className="px-6 py-4 flex items-center justify-between">
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
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side (Desktop) / Top (Mobile): Creator + Photo */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Column Header */}
          <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">{memory.creatorName}'s Prompt</p>
          </div>

          {/* Photo Container */}
          <div className="flex-1 relative flex items-center justify-center p-6">
            <img
              src={memory.photoUrl}
              alt="Memory"
              className="max-w-full max-h-full object-contain"
            />

            {/* Creator Video PiP (Bottom Right Corner) */}
            <div className="absolute bottom-8 right-8 w-36 h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black">
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
              <div className="absolute top-4 right-4 bg-[#FF6B6B]/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-xs font-bold text-white">Videos Synced</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side (Desktop) / Bottom (Mobile): Friend Response */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden border-l border-gray-200">
          {/* Column Header */}
          <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              {memory.friendName ? `${memory.friendName}'s Response` : 'Friend\'s Response'}
            </p>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative flex items-center justify-center p-6 bg-gray-100">
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
        <div className="px-6 text-center">
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
