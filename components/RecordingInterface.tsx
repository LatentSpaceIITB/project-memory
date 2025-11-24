'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Memory, RecordingState } from '@/types/memory';
import { Play, Pause, Mic, Square, Send, RotateCcw, AlertCircle } from 'lucide-react';

interface RecordingInterfaceProps {
  memory: Memory;
}

const MAX_ATTEMPTS = 3;

export default function RecordingInterface({ memory }: RecordingInterfaceProps) {
  const router = useRouter();

  // State management
  const [state, setState] = useState<RecordingState>('initial');
  const [isCreatorVideoPlaying, setIsCreatorVideoPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const creatorVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'recording') {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle creator video playback
  const toggleCreatorVideo = () => {
    if (creatorVideoRef.current) {
      if (isCreatorVideoPlaying) {
        creatorVideoRef.current.pause();
      } else {
        creatorVideoRef.current.play();
      }
      setIsCreatorVideoPlaying(!isCreatorVideoPlaying);
    }
  };

  // Start recording (request camera access)
  const startRecording = async () => {
    if (attemptCount >= MAX_ATTEMPTS) {
      setErrorMessage(`You've reached the maximum of ${MAX_ATTEMPTS} attempts.`);
      return;
    }

    try {
      setState('preparing');
      setErrorMessage(null);

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      cameraStreamRef.current = stream;

      // Show camera preview
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.muted = true; // Mute preview to avoid feedback
      }

      setState('ready');
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('Camera permission denied. Please allow camera access to continue.');
      setState('initial');
    }
  };

  // Begin recording
  const beginRecording = () => {
    if (!cameraStreamRef.current) return;

    try {
      recordedChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(cameraStreamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);

        // Stop camera stream
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((track) => track.stop());
          cameraStreamRef.current = null;
        }

        setState('reviewing');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState('recording');
      setAttemptCount((prev) => prev + 1);
    } catch (err) {
      console.error('Recording error:', err);
      setErrorMessage('Failed to start recording. Please try again.');
      setState('ready');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Re-record (go back to camera)
  const reRecord = () => {
    if (attemptCount >= MAX_ATTEMPTS) {
      setErrorMessage(`You've used all ${MAX_ATTEMPTS} attempts. Please submit your current recording.`);
      return;
    }
    setRecordedBlob(null);
    startRecording();
  };

  // Submit and upload to Firebase
  const submitResponse = async () => {
    if (!recordedBlob) return;

    try {
      setState('uploading');
      setErrorMessage(null);

      // Upload video to Firebase Storage
      const videoFileName = `friend-video-${Date.now()}.webm`;
      const storageRef = ref(storage, `memories/${memory.id}/${videoFileName}`);

      await uploadBytes(storageRef, recordedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore document
      const memoryRef = doc(db, 'memories', memory.id);
      await updateDoc(memoryRef, {
        friendVideoUrl: downloadURL,
        friendSubmittedAt: serverTimestamp(),
        status: 'completed',
      });

      // Redirect to split view
      setState('complete');
      router.push(`/m/${memory.id}`);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage('Failed to upload video. Please try again.');
      setState('reviewing');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      {/* Background Photo Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={memory.photoUrl}
          alt="Memory"
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            opacity: state === 'reviewing' || state === 'uploading' ? 0.4 : 0.6,
            filter: state === 'reviewing' || state === 'uploading' ? 'blur(8px)' : 'none',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Project Memory</p>
          <h1 className="text-xl font-bold mt-1">{memory.creatorPrompt}</h1>
        </div>
        {state === 'recording' && (
          <div className="bg-red-500/80 px-3 py-1 rounded-full text-sm font-mono animate-pulse">
            REC {formatTime(recordingTime)}
          </div>
        )}
        {attemptCount > 0 && state !== 'uploading' && state !== 'complete' && (
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-sm">
            Attempt {attemptCount}/{MAX_ATTEMPTS}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute top-24 left-4 right-4 z-20 bg-red-500/90 backdrop-blur-md p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Video Bubble/Preview */}
      <div
        className={`absolute transition-all duration-500 z-20 shadow-2xl ${
          state === 'initial'
            ? 'bottom-24 right-6 w-32 h-32 rounded-full border-4 border-white'
            : state === 'ready' || state === 'recording'
            ? 'top-24 inset-x-4 h-3/5 w-auto rounded-2xl border-2 border-red-500'
            : state === 'reviewing'
            ? 'top-24 inset-x-4 h-3/5 w-auto rounded-2xl border-none'
            : 'scale-0 opacity-0'
        }`}
      >
        <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-[inherit]">
          {/* Creator's Prompt Video (Initial state) */}
          {state === 'initial' && (
            <>
              <video
                ref={creatorVideoRef}
                src={memory.creatorVideoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                onPlay={() => setIsCreatorVideoPlaying(true)}
                onPause={() => setIsCreatorVideoPlaying(false)}
              />
              {!isCreatorVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                  <Play size={24} fill="white" />
                </div>
              )}
            </>
          )}

          {/* Camera Feed (Ready/Recording states) */}
          {(state === 'ready' || state === 'recording') && (
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          )}

          {/* Recorded Video Playback (Reviewing state) */}
          {state === 'reviewing' && recordedBlob && (
            <video
              ref={reviewVideoRef}
              src={URL.createObjectURL(recordedBlob)}
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-30 flex flex-col items-center">
        {/* Initial State: Show prompt and reply button */}
        {state === 'initial' && (
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-white/80 max-w-[60%]">
              <p className="font-bold">{memory.creatorName} asks:</p>
              <p className="italic">"{memory.creatorPrompt}"</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={toggleCreatorVideo}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition"
              >
                {isCreatorVideoPlaying ? <Pause size={20} /> : <Play size={20} fill="white" />}
              </button>

              <button
                onClick={startRecording}
                className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg"
              >
                <Mic size={18} /> Reply
              </button>
            </div>
          </div>
        )}

        {/* Ready State: Show record button */}
        {state === 'ready' && (
          <button
            onClick={beginRecording}
            className="w-16 h-16 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 transition shadow-lg flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full bg-white"></div>
          </button>
        )}

        {/* Recording State: Show stop button */}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:bg-red-600 transition shadow-lg"
          >
            <Square size={24} fill="white" />
          </button>
        )}

        {/* Reviewing State: Show re-record and submit */}
        {state === 'reviewing' && (
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={reRecord}
              disabled={attemptCount >= MAX_ATTEMPTS}
              className={`w-14 h-14 rounded-full backdrop-blur text-white flex items-center justify-center border transition ${
                attemptCount >= MAX_ATTEMPTS
                  ? 'bg-gray-800/40 border-white/10 opacity-50 cursor-not-allowed'
                  : 'bg-gray-800/80 border-white/10 hover:bg-gray-700/80'
              }`}
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={submitResponse}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition"
            >
              <Send size={18} /> Send Memory
            </button>
          </div>
        )}

        {/* Uploading State: Show progress */}
        {state === 'uploading' && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center w-full">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold mb-2">Creating Memory...</h3>
            <p className="text-sm opacity-70">Uploading your video</p>
          </div>
        )}
      </div>
    </div>
  );
}
