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

  // Assign stream to video element when it becomes available
  useEffect(() => {
    if (cameraStreamRef.current && cameraVideoRef.current && (state === 'ready' || state === 'recording')) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
      cameraVideoRef.current.play().catch((err) => {
        console.error('Video play error in useEffect:', err);
      });
    }
  }, [state, cameraStreamRef.current]);

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden flex flex-col items-center justify-center font-sans text-gray-900">
      {/* Background Photo Layer */}
      <div className="absolute inset-0 z-0">
        {/* Background Layer: Blurred backdrop to fill empty space */}
        <div className="absolute inset-0">
          <img
            src={memory.photoUrl}
            alt="Background"
            className="w-full h-full object-cover blur-2xl scale-110 transition-all duration-500"
            style={{
              opacity: state === 'reviewing' || state === 'uploading' ? 0.2 : 0.6,
              filter: state === 'reviewing' || state === 'uploading' ? 'blur(16px)' : 'blur(24px)',
            }}
          />
        </div>

        {/* Foreground Layer: Actual photo with proper aspect ratio */}
        <img
          src={memory.photoUrl}
          alt="Memory"
          className="relative w-full h-full object-contain z-10 transition-all duration-500"
          style={{
            opacity: state === 'reviewing' || state === 'uploading' ? 0.3 : 1,
            filter: state === 'reviewing' || state === 'uploading' ? 'blur(12px)' : 'none',
          }}
        />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30">
        <div className="flex justify-between items-start">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-lg">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">Project Memory</p>
            <h1 className="text-base font-bold text-gray-900">{memory.creatorPrompt}</h1>
          </div>
          {attemptCount > 0 && state !== 'uploading' && state !== 'complete' && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
              Attempt {attemptCount}/{MAX_ATTEMPTS}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute top-24 left-4 right-4 z-20 bg-red-500/90 backdrop-blur-md p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Creator Video PiP (Initial state - bottom-right) */}
      {state === 'initial' && (
        <div className="absolute bottom-32 right-6 z-20 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
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
            <button
              onClick={toggleCreatorVideo}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
            >
              <Play size={32} fill="white" className="drop-shadow-lg" />
            </button>
          )}
        </div>
      )}

      {/* Friend Camera PiP (Ready/Recording states - top-right, small) */}
      {(state === 'ready' || state === 'recording') && (
        <div className="absolute top-24 right-6 z-20 w-48 h-64 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-black">
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
            onLoadedMetadata={(e) => {
              // Ensure video plays when metadata is loaded
              const video = e.currentTarget;
              video.play().catch((err) => {
                console.error('Video autoplay failed:', err);
              });
            }}
          />
          {/* Recording indicator inside PiP */}
          {state === 'recording' && (
            <div className="absolute top-3 left-3 bg-red-500 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              REC {formatTime(recordingTime)}
            </div>
          )}
        </div>
      )}

      {/* Friend Video Review (Full screen - reviewing state) */}
      {state === 'reviewing' && recordedBlob && (
        <div className="absolute inset-x-0 top-0 bottom-24 z-40 flex items-center justify-center p-6 bg-black/90">
          <div className="relative w-full h-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={reviewVideoRef}
              src={URL.createObjectURL(recordedBlob)}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-50 flex flex-col items-center">
        {/* Initial State: Show prompt and reply button */}
        {state === 'initial' && (
          <div className="flex gap-4 items-center">
            <button
              onClick={toggleCreatorVideo}
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border-2 border-gray-200 hover:bg-white transition shadow-lg"
            >
              {isCreatorVideoPlaying ? <Pause size={24} className="text-gray-900" /> : <Play size={24} fill="gray-900" className="text-gray-900" />}
            </button>

            <button
              onClick={startRecording}
              className="bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-[#FF5252] transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Mic size={20} /> Record Your Response
            </button>
          </div>
        )}

        {/* Ready State: Show record button */}
        {state === 'ready' && (
          <button
            onClick={beginRecording}
            className="w-20 h-20 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 transition shadow-xl flex items-center justify-center hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-white"></div>
          </button>
        )}

        {/* Recording State: Show stop button */}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:bg-red-600 transition shadow-xl hover:scale-105"
          >
            <Square size={32} fill="white" className="text-white" />
          </button>
        )}

        {/* Reviewing State: Show re-record and submit */}
        {state === 'reviewing' && (
          <div className="flex gap-4 w-full max-w-md justify-center">
            <button
              onClick={reRecord}
              disabled={attemptCount >= MAX_ATTEMPTS}
              className={`w-16 h-16 rounded-full backdrop-blur-lg flex items-center justify-center border-2 transition-all ${
                attemptCount >= MAX_ATTEMPTS
                  ? 'bg-gray-400/40 border-gray-300/20 opacity-50 cursor-not-allowed'
                  : 'bg-white/90 border-gray-200 hover:bg-white'
              }`}
            >
              <RotateCcw size={24} className={attemptCount >= MAX_ATTEMPTS ? 'text-gray-400' : 'text-gray-900'} />
            </button>

            <button
              onClick={submitResponse}
              className="flex-1 bg-[#007BFF] text-white px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:bg-[#0056b3] transition-all hover:scale-105"
            >
              <Send size={20} /> Submit Memory
            </button>
          </div>
        )}

        {/* Uploading State: Show progress */}
        {state === 'uploading' && (
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl text-center w-full max-w-md border border-gray-200">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Creating Memory...</h3>
            <p className="text-sm text-gray-600">Uploading your video</p>
          </div>
        )}
      </div>
    </div>
  );
}
