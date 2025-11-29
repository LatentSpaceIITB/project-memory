'use client';

import { Download, X } from 'lucide-react';
import { useVideoExport } from '@/hooks/useVideoExport';
import { Memory } from '@/types/memory';
import { useEffect, useState } from 'react';

interface ExportButtonProps {
  memory: Memory;
  currentVideoUrl: string;
}

export default function ExportButton({ memory, currentVideoUrl }: ExportButtonProps) {
  const { state, startExport, reset } = useVideoExport();
  const [isCompatible, setIsCompatible] = useState(true);

  useEffect(() => {
    // Check browser compatibility on mount
    const checkCompatibility = async () => {
      const { checkExportCompatibility } = await import('@/lib/videoExport/compatibility');
      const report = checkExportCompatibility();
      setIsCompatible(report.canExport);
    };
    checkCompatibility();
  }, []);

  const handleExport = async () => {
    if (!memory.friendVideoUrl && !currentVideoUrl) {
      alert('No video available to export');
      return;
    }

    // Double-check compatibility
    const { checkExportCompatibility } = await import('@/lib/videoExport/compatibility');
    const report = checkExportCompatibility();

    if (!report.canExport) {
      alert(
        `Video export is not supported in your browser.\n\n` +
        `Limitations:\n${report.limitations.join('\n')}\n\n` +
        `Please use: ${report.recommendedBrowser}`
      );
      return;
    }

    await startExport({
      photoUrl: memory.photoUrl,
      creatorVideoUrl: memory.creatorVideoUrl,
      friendVideoUrl: currentVideoUrl || memory.friendVideoUrl || '',
      creatorName: memory.creatorName,
      friendName: memory.friendName || 'Friend',
      onProgress: (progress, status) => {
        console.log(`Export: ${Math.round(progress)}% - ${status}`);
      },
      onComplete: (blob) => {
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-memory-${memory.id}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show success message briefly
        setTimeout(() => {
          reset();
        }, 2000);
      },
      onError: (error) => {
        console.error('Export failed:', error);
        alert(`Export failed: ${error.message}\n\nPlease try again or use a different browser (Chrome/Firefox recommended).`);
        reset();
      }
    });
  };

  // Show error state
  if (state.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <X size={16} className="text-red-600" />
          <span className="text-sm text-red-600 font-medium">Export failed</span>
          <button
            onClick={reset}
            className="text-xs text-red-600 underline ml-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show success state
  if (state.status === 'complete') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-sm text-green-700 font-medium">Video exported!</span>
        </div>
      </div>
    );
  }

  // Show progress during export
  if (state.status === 'rendering' || state.status === 'encoding' || state.status === 'preparing') {
    return (
      <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-[#FF6B6B] rounded-full animate-spin" />
          <div className="text-sm min-w-[200px]">
            <p className="font-semibold text-gray-900 mb-1">{state.currentTask}</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6B6B] transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 min-w-[35px]">{Math.round(state.progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show button if not compatible
  if (!isCompatible) {
    return null;
  }

  // Default idle state - show export button
  return (
    <button
      onClick={handleExport}
      disabled={state.status !== 'idle'}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B6B] text-white font-medium text-sm hover:bg-[#FF5252] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export as 9:16 vertical video for Instagram Stories/Reels"
    >
      <Download size={16} />
      <span>Export Video</span>
    </button>
  );
}
