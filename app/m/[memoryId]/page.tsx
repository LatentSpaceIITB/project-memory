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

  // Auto-play both videos once when they're loaded
  useEffect(() => {
    if (memory && !hasAutoPlayed) {
      const timer = setTimeout(() => {
        if (creatorVideoRef.current && friendVideoRef.current) {
          creatorVideoRef.current.play().catch(() => {
            // Autoplay might be blocked by browser
            console.log('Autoplay blocked for creator video');
          });
          friendVideoRef.current.play().catch(() => {
            console.log('Autoplay blocked for friend video');
          });
          setHasAutoPlayed(true);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-70">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-white/70 mb-6">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Project Memory</p>
            <h1 className="text-lg font-bold mt-1">{memory.creatorPrompt}</h1>
          </div>
          <button
            onClick={shareMemory}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </header>

      {/* Split View Container */}
      <main className="pt-20 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side (Desktop) / Top (Mobile): Creator + Photo */}
        <div className="flex-1 relative bg-gray-900 flex flex-col items-center justify-center min-h-[50vh] lg:min-h-screen">
          {/* Background Photo */}
          <div className="absolute inset-0 z-0">
            <img
              src={memory.photoUrl}
              alt="Memory"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
          </div>

          {/* Creator Video Overlay (Bottom Right Corner) */}
          <div className="absolute bottom-6 right-6 z-10 w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <video
              ref={creatorVideoRef}
              src={memory.creatorVideoUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              controls
            />
          </div>

          {/* Label */}
          <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
            <p className="text-sm font-semibold">{memory.creatorName}'s Prompt</p>
          </div>
        </div>

        {/* Right Side (Desktop) / Bottom (Mobile): Friend Response */}
        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[50vh] lg:min-h-screen">
          <video
            ref={friendVideoRef}
            src={memory.friendVideoUrl}
            className="w-full h-full object-contain"
            controls
            playsInline
          />

          {/* Label */}
          <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
            <p className="text-sm font-semibold">
              {memory.friendName ? `${memory.friendName}'s Response` : 'Friend\'s Response'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-white/60">
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
