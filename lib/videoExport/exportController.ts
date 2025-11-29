import { EXPORT_CONFIG, ExportOptions, loadVideo } from '@/lib/videoExport';
import { FrameRenderer } from './frameRenderer';
import { AudioMixer } from './audioMixer';

export class ExportController {
  private frameRenderer: FrameRenderer;
  private audioMixer: AudioMixer;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private creatorVideoEl: HTMLVideoElement | null = null;
  private friendVideoEl: HTMLVideoElement | null = null;

  constructor() {
    this.frameRenderer = new FrameRenderer();
    this.audioMixer = new AudioMixer();
  }

  async export(options: ExportOptions): Promise<Blob> {
    try {
      // 1. Preload and prepare assets
      options.onProgress(5, 'Loading assets...');
      await this.preloadAssets(options);

      // 2. Setup audio mixing
      options.onProgress(10, 'Setting up audio...');
      const audioStream = this.audioMixer.createSequencedAudio(
        this.creatorVideoEl!,
        this.friendVideoEl!
      );

      // 3. Setup canvas stream
      const canvas = this.frameRenderer.canvas;
      const canvasStream = canvas.captureStream(EXPORT_CONFIG.FPS);

      // 4. Combine video + audio streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      // 5. Start MediaRecorder
      options.onProgress(15, 'Starting recording...');
      await this.startRecording(combinedStream);

      // 6. Render loop
      await this.renderLoop(options.onProgress);

      // 7. Stop recording and return blob
      options.onProgress(95, 'Finalizing video...');
      const blob = await this.stopRecording();

      // 8. Cleanup
      this.cleanup();

      return blob;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private async preloadAssets(options: ExportOptions): Promise<void> {
    // Load photo
    await this.frameRenderer.preloadPhoto(options.photoUrl);

    // Create and load video elements
    this.creatorVideoEl = await loadVideo(options.creatorVideoUrl);
    this.friendVideoEl = await loadVideo(options.friendVideoUrl);

    // Ensure videos are ready
    await Promise.all([
      this.ensureVideoReady(this.creatorVideoEl),
      this.ensureVideoReady(this.friendVideoEl)
    ]);
  }

  private ensureVideoReady(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      if (video.readyState >= 2) {
        resolve();
      } else {
        video.addEventListener('loadeddata', () => resolve(), { once: true });
      }
    });
  }

  private async renderLoop(onProgress: (p: number, status: string) => void): Promise<void> {
    const creatorDuration = this.creatorVideoEl!.duration;
    const friendDuration = this.friendVideoEl!.duration;
    const endCardDuration = 3; // 3 seconds
    const totalDuration = creatorDuration + friendDuration + endCardDuration;

    const fps = EXPORT_CONFIG.FPS;
    const frameDuration = 1 / fps;
    let currentTime = 0;

    // PHASE 1: Creator plays, friend paused (0 → creatorDuration)
    onProgress(15, 'Rendering creator video...');

    while (currentTime < creatorDuration) {
      this.creatorVideoEl!.currentTime = currentTime;
      this.friendVideoEl!.currentTime = 0; // Paused at start

      this.frameRenderer.renderFrame(
        this.creatorVideoEl!,
        this.friendVideoEl!,
        true // show watermark
      );

      currentTime += frameDuration;
      const progress = 15 + (currentTime / totalDuration) * 70; // 15% to 85%
      onProgress(progress, 'Rendering creator video...');

      await this.waitForNextFrame();
    }

    // PHASE 2: Creator frozen, friend plays (creatorDuration → end)
    const phase2StartProgress = 15 + (creatorDuration / totalDuration) * 70;
    onProgress(phase2StartProgress, 'Rendering friend video...');

    // Freeze creator on last frame
    this.creatorVideoEl!.currentTime = Math.max(0, creatorDuration - 0.1);

    let friendTime = 0;
    while (friendTime < friendDuration) {
      this.friendVideoEl!.currentTime = friendTime;

      this.frameRenderer.renderFrame(
        this.creatorVideoEl!,
        this.friendVideoEl!,
        true
      );

      friendTime += frameDuration;
      currentTime += frameDuration;
      const progress = 15 + (currentTime / totalDuration) * 70;
      onProgress(progress, 'Rendering friend video...');

      await this.waitForNextFrame();
    }

    // PHASE 3: End card (fade to black + CTA)
    onProgress(85, 'Rendering end card...');
    await this.renderEndCard(onProgress, totalDuration, endCardDuration);
  }

  private async renderEndCard(
    onProgress: (p: number, status: string) => void,
    totalDuration: number,
    endCardDuration: number
  ): Promise<void> {
    const fps = EXPORT_CONFIG.FPS;
    const frameDuration = 1 / fps;
    const fadeFrames = Math.floor(fps * 0.5); // 0.5s fade

    const ctx = this.frameRenderer.ctx;

    // Capture current frame for fade
    const currentFrame = ctx.getImageData(0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.HEIGHT);

    // Fade out current frame to black
    for (let i = 0; i < fadeFrames; i++) {
      // Draw current frame
      ctx.putImageData(currentFrame, 0, 0);

      // Overlay black with increasing opacity
      const alpha = i / fadeFrames;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.HEIGHT);

      await this.waitForNextFrame();
    }

    // Full black screen with text
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.HEIGHT);

    // Draw text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Project Memory', EXPORT_CONFIG.WIDTH / 2, 900);

    ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Create your own at', EXPORT_CONFIG.WIDTH / 2, 980);
    ctx.fillText('latentspaces.in', EXPORT_CONFIG.WIDTH / 2, 1040);

    // Hold end card for remaining duration
    const holdFrames = Math.floor(fps * (endCardDuration - 0.5));
    for (let i = 0; i < holdFrames; i++) {
      const progress = 85 + (i / holdFrames) * 10; // 85% to 95%
      onProgress(progress, 'Rendering end card...');
      await this.waitForNextFrame();
    }
  }

  private startRecording(stream: MediaStream): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Try with preferred codec
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: EXPORT_CONFIG.VIDEO_CODEC,
          videoBitsPerSecond: 5000000, // 5 Mbps
        });
      } catch (e) {
        // Fallback to default/simpler codec
        try {
          this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: EXPORT_CONFIG.FALLBACK_CODEC,
          });
        } catch (e2) {
          // Last resort - use browser default
          this.mediaRecorder = new MediaRecorder(stream);
        }
      }

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => resolve();
      this.mediaRecorder.onerror = (error) => reject(error);

      this.mediaRecorder.start();
    });
  }

  private stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private waitForNextFrame(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => resolve());
    });
  }

  private cleanup(): void {
    this.frameRenderer.cleanup();
    this.audioMixer.cleanup();

    if (this.creatorVideoEl) {
      this.creatorVideoEl.remove();
      this.creatorVideoEl = null;
    }

    if (this.friendVideoEl) {
      this.friendVideoEl.remove();
      this.friendVideoEl = null;
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}
