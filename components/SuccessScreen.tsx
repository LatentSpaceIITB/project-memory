'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Share2, RefreshCw } from 'lucide-react';

interface SuccessScreenProps {
  inviteLink: string;
  memoryId: string;
  photoUrl: string;
  creatorName: string;
}

export default function SuccessScreen({
  inviteLink,
  memoryId,
  photoUrl,
  creatorName,
}: SuccessScreenProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Project Memory',
      text: `${creatorName} wants to create a memory with you!`,
      url: inviteLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error - fallback to copy
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      // Fallback: Just copy to clipboard
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900">
          Your Memory is Ready!
        </h1>
        <p className="text-gray-600 text-center mb-8 text-lg">
          Share this link with your friend to capture their response
        </p>

        {/* Link Display */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-transparent text-gray-900 font-mono text-sm outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center"
            title="Copy link"
          >
            {copySuccess ? (
              <Check size={20} className="text-green-500" />
            ) : (
              <Copy size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Copy Success Feedback */}
        {copySuccess && (
          <div className="mb-6 text-center">
            <p className="text-sm text-green-600 font-medium">Link copied to clipboard!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={handleShare}
            className="w-full bg-[#FF6B6B] text-white px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#FF5252] transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <Share2 size={20} /> Share Link
          </button>

          <Link
            href="/create"
            className="w-full bg-white border-2 border-gray-200 text-gray-900 px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-center"
          >
            <RefreshCw size={20} /> Create Another Memory
          </Link>
        </div>

        {/* Preview Card */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-start gap-4">
            {/* Photo Thumbnail */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={photoUrl}
                alt="Memory photo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Memory Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                Your Memory
              </p>
              <p className="text-base text-gray-900 mb-2">
                Your friend will see your photo and watch your video question
              </p>
              <p className="text-sm text-gray-500">
                Created by {creatorName}
              </p>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Send this link to your friend via text, email, or social media
          </p>
        </div>
      </div>
    </div>
  );
}
