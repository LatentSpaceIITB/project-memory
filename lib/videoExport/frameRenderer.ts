import { EXPORT_CONFIG, loadImage } from '@/lib/videoExport';

export class FrameRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private cachedPhoto: HTMLImageElement | null = null;
  private cachedBlurredBg: HTMLCanvasElement | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = EXPORT_CONFIG.WIDTH;
    this.canvas.height = EXPORT_CONFIG.HEIGHT;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  async preloadPhoto(photoUrl: string): Promise<void> {
    // Load photo
    this.cachedPhoto = await loadImage(photoUrl);

    // Create blurred background canvas (cached for performance)
    this.cachedBlurredBg = this.createBlurredBackground(this.cachedPhoto);
  }

  renderFrame(
    creatorVideo: HTMLVideoElement,
    friendVideo: HTMLVideoElement,
    showWatermark: boolean = true
  ): void {
    const ctx = this.ctx;

    // 1. Draw blurred background (fills entire canvas)
    if (this.cachedBlurredBg) {
      ctx.globalAlpha = EXPORT_CONFIG.BACKGROUND_OPACITY;
      ctx.drawImage(this.cachedBlurredBg, 0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.HEIGHT);
      ctx.globalAlpha = 1.0;
    }

    // 2. Draw clean photo (top half, centered, object-contain)
    if (this.cachedPhoto) {
      const photoRect = this.calculateContainRect(
        this.cachedPhoto,
        0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.PHOTO_HEIGHT
      );
      ctx.drawImage(
        this.cachedPhoto,
        photoRect.x, photoRect.y,
        photoRect.width, photoRect.height
      );
    }

    // 3. Draw friend video (bottom half, centered, object-contain)
    const videoRect = this.calculateContainRect(
      friendVideo,
      0, EXPORT_CONFIG.PHOTO_HEIGHT, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.VIDEO_HEIGHT
    );
    ctx.drawImage(
      friendVideo,
      videoRect.x, videoRect.y,
      videoRect.width, videoRect.height
    );

    // 4. Draw creator PiP circle (bottom-right of photo region)
    this.drawCreatorPip(creatorVideo);

    // 5. Draw watermark
    if (showWatermark) {
      this.drawWatermark();
    }
  }

  private drawCreatorPip(video: HTMLVideoElement): void {
    const pip = {
      x: EXPORT_CONFIG.WIDTH - EXPORT_CONFIG.CREATOR_PIP_SIZE - EXPORT_CONFIG.CREATOR_PIP_PADDING,  // right edge - size - padding
      y: EXPORT_CONFIG.PHOTO_HEIGHT - EXPORT_CONFIG.CREATOR_PIP_SIZE - EXPORT_CONFIG.CREATOR_PIP_PADDING,   // photo bottom - size - padding
      size: EXPORT_CONFIG.CREATOR_PIP_SIZE,
      radius: EXPORT_CONFIG.CREATOR_PIP_SIZE / 2
    };

    const ctx = this.ctx;
    ctx.save();

    // Create circular clip path
    ctx.beginPath();
    ctx.arc(
      pip.x + pip.radius,
      pip.y + pip.radius,
      pip.radius,
      0, Math.PI * 2
    );
    ctx.clip();

    // Draw video frame
    ctx.drawImage(video, pip.x, pip.y, pip.size, pip.size);

    ctx.restore();

    // Draw white border ring
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      pip.x + pip.radius,
      pip.y + pip.radius,
      pip.radius,
      0, Math.PI * 2
    );
    ctx.stroke();
  }

  private drawWatermark(): void {
    const ctx = this.ctx;
    const watermarkY = EXPORT_CONFIG.HEIGHT - EXPORT_CONFIG.WATERMARK_HEIGHT;

    // Semi-transparent black background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, watermarkY, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.WATERMARK_HEIGHT);

    // White text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Made with Project Memory', EXPORT_CONFIG.WIDTH / 2, watermarkY + EXPORT_CONFIG.WATERMARK_HEIGHT / 2);
  }

  private createBlurredBackground(img: HTMLImageElement): HTMLCanvasElement {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = EXPORT_CONFIG.WIDTH;
    bgCanvas.height = EXPORT_CONFIG.HEIGHT;
    const bgCtx = bgCanvas.getContext('2d');

    if (!bgCtx) {
      throw new Error('Failed to get 2D context for background canvas');
    }

    // Calculate how to fill the entire canvas with the image (cover behavior)
    const imgRatio = img.width / img.height;
    const canvasRatio = EXPORT_CONFIG.WIDTH / EXPORT_CONFIG.HEIGHT;

    let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

    if (imgRatio > canvasRatio) {
      // Image is wider - crop sides
      sourceWidth = img.height * canvasRatio;
      sourceX = (img.width - sourceWidth) / 2;
    } else {
      // Image is taller - crop top/bottom
      sourceHeight = img.width / canvasRatio;
      sourceY = (img.height - sourceHeight) / 2;
    }

    // Draw scaled and cropped image
    bgCtx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, EXPORT_CONFIG.WIDTH, EXPORT_CONFIG.HEIGHT
    );

    // Apply blur filter
    bgCtx.filter = `blur(${EXPORT_CONFIG.BLUR_RADIUS}px)`;
    bgCtx.drawImage(bgCanvas, 0, 0);
    bgCtx.filter = 'none';

    return bgCanvas;
  }

  private calculateContainRect(
    media: HTMLImageElement | HTMLVideoElement,
    targetX: number,
    targetY: number,
    targetW: number,
    targetH: number
  ): { x: number; y: number; width: number; height: number } {
    const mediaWidth = (media as HTMLVideoElement).videoWidth || (media as HTMLImageElement).width;
    const mediaHeight = (media as HTMLVideoElement).videoHeight || (media as HTMLImageElement).height;

    const mediaRatio = mediaWidth / mediaHeight;
    const targetRatio = targetW / targetH;

    let width, height, x, y;

    if (mediaRatio > targetRatio) {
      // Media is wider - fit to width
      width = targetW;
      height = targetW / mediaRatio;
      x = targetX;
      y = targetY + (targetH - height) / 2;
    } else {
      // Media is taller - fit to height
      height = targetH;
      width = targetH * mediaRatio;
      x = targetX + (targetW - width) / 2;
      y = targetY;
    }

    return { x, y, width, height };
  }

  cleanup(): void {
    this.cachedPhoto = null;
    this.cachedBlurredBg = null;
  }
}
