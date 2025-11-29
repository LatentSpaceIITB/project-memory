export const EXPORT_CONFIG = {
  WIDTH: 1080,
  HEIGHT: 1920,
  FPS: 30,
  VIDEO_CODEC: 'video/webm;codecs=vp9,opus',
  FALLBACK_CODEC: 'video/webm',

  // Canvas layout
  PHOTO_HEIGHT: 960,      // Top half
  VIDEO_HEIGHT: 960,      // Bottom half
  CREATOR_PIP_SIZE: 156,
  CREATOR_PIP_PADDING: 32,
  WATERMARK_HEIGHT: 80,

  // Visual effects
  BLUR_RADIUS: 40,
  BACKGROUND_OPACITY: 0.3,
} as const;

export interface ExportOptions {
  photoUrl: string;
  creatorVideoUrl: string;
  friendVideoUrl: string;
  creatorName: string;
  friendName: string;
  onProgress: (progress: number, status: string) => void;
  onComplete: (blob: Blob) => void;
  onError: (error: Error) => void;
}

export interface ExportState {
  status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  currentTask: string;
  error: Error | null;
}

// Utility function to load an image
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// Utility function to load a video
export function loadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true; // Start muted, audio handled by AudioMixer
    video.playsInline = true;

    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
  });
}
