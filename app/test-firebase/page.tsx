'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [memoryData, setMemoryData] = useState<any>(null);

  useEffect(() => {
    const testFirebase = async () => {
      // Step 1: Check environment variables
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
      };
      setConfigStatus(config);

      // Step 2: Try to read from Firestore
      try {
        setStatus('Attempting to read from Firestore...');

        const memoriesRef = collection(db, 'memories');
        const q = query(memoriesRef, where('inviteId', '==', 'amaresh-test-1'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setStatus('⚠️ No memory found with inviteId "amaresh-test-1"');
          setError('Make sure you created the document in Firestore with the correct inviteId field.');
        } else {
          const memoryDoc = querySnapshot.docs[0];
          setMemoryData(memoryDoc.data());
          setStatus('✅ SUCCESS! Firebase is working correctly!');
        }
      } catch (err: any) {
        setStatus('❌ FIREBASE ERROR');
        setError(err.message);

        if (err.code === 'permission-denied') {
          setError(
            'PERMISSION DENIED: Your Firestore security rules are blocking reads. Follow the fix in FIREBASE_FIX.md'
          );
        }
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Connection Test</h1>

        {/* Environment Variables */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          {configStatus && (
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(configStatus).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-white/70">{key}:</span>
                  <span>{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Connection Status</h2>
          <div className="text-lg mb-4">{status}</div>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded p-4 mb-4">
              <p className="font-bold text-red-400 mb-2">Error Details:</p>
              <p className="text-sm font-mono text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Memory Data */}
        {memoryData && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Memory Data Found</h2>
            <pre className="bg-black/50 p-4 rounded overflow-x-auto text-xs">
              {JSON.stringify(memoryData, null, 2)}
            </pre>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          <ul className="space-y-2 text-sm">
            <li>
              {error?.includes('permission') ? (
                <span className="text-red-400">
                  ❌ Fix Firebase rules: See <code className="bg-black/50 px-2 py-1 rounded">FIREBASE_FIX.md</code>
                </span>
              ) : error?.includes('No memory found') ? (
                <span className="text-yellow-400">
                  ⚠️ Create the memory document in Firestore with inviteId: "amaresh-test-1"
                </span>
              ) : memoryData ? (
                <span className="text-green-400">
                  ✅ Everything works! Try the actual page:{' '}
                  <a href="/r/amaresh-test-1" className="underline">
                    /r/amaresh-test-1
                  </a>
                </span>
              ) : (
                <span className="text-white/70">⏳ Testing in progress...</span>
              )}
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4">
          <a
            href="/r/amaresh-test-1"
            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition"
          >
            Try Friend Response Page
          </a>
          <a
            href="/"
            className="bg-white/10 border border-white/20 px-6 py-3 rounded-lg font-bold hover:bg-white/20 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
