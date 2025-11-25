'use client';

import { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { CreatorState } from '@/types/memory';
import { validateCreatorName, validatePrompt } from '@/lib/validation';
import { createMemory } from '@/lib/memoryCreation';
import PhotoUpload from '@/components/PhotoUpload';
import CreatorRecordingInterface from '@/components/CreatorRecordingInterface';
import SuccessScreen from '@/components/SuccessScreen';

export default function CreateMemoryPage() {
  // State machine
  const [state, setState] = useState<CreatorState>('photo-upload');

  // Form data
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  // Success data
  const [memoryId, setMemoryId] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Character counts
  const nameCharsRemaining = 50 - creatorName.length;

  // Handle photo selection
  const handlePhotoSelected = (file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoPreviewUrl(previewUrl);
    setState('photo-preview');
  };

  // Validate and proceed to video recording
  const handleProceedToVideo = () => {
    // Validate name
    const nameValidation = validateCreatorName(creatorName);
    if (!nameValidation.valid) {
      setNameError(nameValidation.error || 'Invalid name');
      return;
    }
    setNameError(null);

    // Proceed to video recording
    setState('video-preparing');
  };

  // Handle video recorded
  const handleVideoRecorded = (blob: Blob) => {
    setVideoBlob(blob);
    uploadMemory(blob);
  };

  // Upload to Firebase
  const uploadMemory = async (blob: Blob) => {
    if (!photoFile || !creatorName) {
      setUploadError('Missing required data');
      return;
    }

    try {
      setState('uploading');
      setUploadError(null);

      // Use a default prompt since creator will ask the question in the video
      const defaultPrompt = "What's the story behind this picture?";

      const result = await createMemory(
        photoFile,
        blob,
        creatorName.trim(),
        defaultPrompt
      );

      setMemoryId(result.memoryId);
      setInviteLink(result.inviteLink);
      setState('success');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to create memory. Please try again.');
      setState('photo-preview');
    }
  };

  // Back to photo preview
  const handleBackToPreview = () => {
    setState('photo-preview');
  };

  // Render based on state
  if (state === 'photo-upload') {
    return <PhotoUpload onPhotoSelected={handlePhotoSelected} />;
  }

  if (state === 'photo-preview') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {/* Background Photo Preview */}
        {photoPreviewUrl && (
          <div className="fixed inset-0 z-0">
            <img
              src={photoPreviewUrl}
              alt="Selected photo"
              className="w-full h-full object-cover opacity-20 blur-sm"
            />
          </div>
        )}

        <div className="relative z-10 w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Almost there!</h1>
            <p className="text-lg text-gray-600">Enter your name before recording</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200">
            {/* Photo Preview */}
            {photoPreviewUrl && (
              <div className="mb-8">
                <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={photoPreviewUrl}
                    alt="Selected photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => setState('photo-upload')}
                  className="mt-3 text-sm text-[#FF6B6B] hover:text-[#FF5252] font-medium"
                >
                  Change Photo
                </button>
              </div>
            )}

            {/* Creator Name Input */}
            <div className="mb-8">
              <label htmlFor="creatorName" className="block text-sm font-bold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="creatorName"
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF6B6B] focus:outline-none text-gray-900 placeholder-gray-400 transition"
              />
              <div className="flex justify-between items-center mt-2">
                {nameError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {nameError}
                  </p>
                )}
                <p className={`text-xs ml-auto ${nameCharsRemaining < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                  {nameCharsRemaining} characters remaining
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 font-medium mb-1">Next: Record Your Video</p>
              <p className="text-sm text-blue-700">
                You'll record yourself asking a question about this photo. Your friend will see and hear your question in the video.
              </p>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleProceedToVideo}
              disabled={!creatorName.trim()}
              className="w-full bg-[#FF6B6B] text-white px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#FF5252] transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Next: Record Your Question <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    state === 'video-preparing' ||
    state === 'video-ready' ||
    state === 'video-recording' ||
    state === 'video-reviewing'
  ) {
    return (
      <CreatorRecordingInterface
        photoUrl={photoPreviewUrl!}
        creatorName={creatorName}
        onVideoRecorded={handleVideoRecorded}
        onBack={handleBackToPreview}
      />
    );
  }

  if (state === 'uploading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Creating Your Memory...</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Uploading photo
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Uploading video
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Generating invite link
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <SuccessScreen
        inviteLink={inviteLink}
        memoryId={memoryId}
        photoUrl={photoPreviewUrl!}
        creatorName={creatorName}
      />
    );
  }

  return null;
}
