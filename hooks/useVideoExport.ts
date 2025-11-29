'use client';

import { useState } from 'react';
import { ExportOptions, ExportState } from '@/lib/videoExport';

export function useVideoExport() {
  const [state, setState] = useState<ExportState>({
    status: 'idle',
    progress: 0,
    currentTask: '',
    error: null
  });

  const startExport = async (options: ExportOptions) => {
    try {
      setState({ status: 'preparing', progress: 0, currentTask: 'Loading assets...', error: null });

      // Dynamic import to avoid loading export controller on page load
      const { ExportController } = await import('@/lib/videoExport/exportController');
      const controller = new ExportController();

      const blob = await controller.export({
        ...options,
        onProgress: (progress, status) => {
          setState(prev => ({
            ...prev,
            status: progress < 100 ? 'rendering' : 'encoding',
            progress,
            currentTask: status
          }));
          options.onProgress(progress, status);
        }
      });

      setState({ status: 'complete', progress: 100, currentTask: 'Done!', error: null });
      options.onComplete(blob);
    } catch (error) {
      console.error('Export failed:', error);
      setState({
        status: 'error',
        progress: 0,
        currentTask: '',
        error: error as Error
      });
      options.onError(error as Error);
    }
  };

  const cancelExport = () => {
    setState({ status: 'idle', progress: 0, currentTask: '', error: null });
  };

  const reset = () => {
    setState({ status: 'idle', progress: 0, currentTask: '', error: null });
  };

  return { state, startExport, cancelExport, reset };
}
