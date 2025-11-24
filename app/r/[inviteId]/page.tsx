'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Memory } from '@/types/memory';
import RecordingInterface from '@/components/RecordingInterface';

export default function FriendResponsePage() {
  const params = useParams();
  const router = useRouter();
  const inviteId = params.inviteId as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        // Query Firestore for memory with matching inviteId
        const memoriesRef = collection(db, 'memories');
        const q = query(memoriesRef, where('inviteId', '==', inviteId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Memory not found. Check your link.');
          setLoading(false);
          return;
        }

        const memoryDoc = querySnapshot.docs[0];
        const memoryData = {
          ...memoryDoc.data(),
          id: memoryDoc.id,
          createdAt: memoryDoc.data().createdAt?.toDate(),
          friendSubmittedAt: memoryDoc.data().friendSubmittedAt?.toDate(),
        } as Memory;

        // Check if friend has already responded
        if (memoryData.status === 'completed') {
          // Redirect to the final split view
          router.push(`/m/${memoryData.id}`);
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
  }, [inviteId, router]);

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

  return <RecordingInterface memory={memory} />;
}
