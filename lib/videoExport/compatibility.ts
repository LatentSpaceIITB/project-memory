export interface CompatibilityReport {
  canExport: boolean;
  limitations: string[];
  warnings: string[];
  recommendedBrowser?: string;
}

export function checkExportCompatibility(): CompatibilityReport {
  const report: CompatibilityReport = {
    canExport: true,
    limitations: [],
    warnings: []
  };

  // Check if running in browser
  if (typeof window === 'undefined') {
    report.canExport = false;
    report.limitations.push('Export only works in browser environment');
    return report;
  }

  // Check MediaRecorder API
  if (!window.MediaRecorder) {
    report.canExport = false;
    report.limitations.push('MediaRecorder API not supported');
    report.recommendedBrowser = 'Chrome or Firefox';
    return report;
  }

  // Check canvas.captureStream
  const canvas = document.createElement('canvas');
  if (typeof (canvas as any).captureStream !== 'function') {
    report.canExport = false;
    report.limitations.push('Canvas.captureStream not supported');
    report.recommendedBrowser = 'Chrome or Firefox';
    return report;
  }

  // Check Web Audio API
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    report.warnings.push('Web Audio API not available - audio mixing may fail');
  }

  // iOS Safari specific - has very limited MediaRecorder support
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    report.canExport = false;
    report.limitations.push('iOS Safari has limited MediaRecorder support');
    report.limitations.push('Video export quality may be poor or fail completely');
    report.recommendedBrowser = 'Use desktop Chrome or Firefox for best results';
    return report;
  }

  // Mobile detection (Android, etc.)
  const isMobile = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    report.warnings.push('Mobile export may have quality or performance limitations');
    report.warnings.push('Desktop browsers recommended for best results');
  }

  // Check for older browsers
  const isOldEdge = /Edge\/(\d+)/.test(navigator.userAgent);
  if (isOldEdge) {
    report.warnings.push('Legacy Edge browser detected - consider using modern Edge (Chromium)');
  }

  // Safari detection (non-iOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari && !isIOS) {
    report.warnings.push('Safari support is experimental - Chrome or Firefox recommended');
  }

  return report;
}

/**
 * Show a user-friendly compatibility warning dialog
 * Returns true if user should proceed, false if they should stop
 */
export function showCompatibilityWarning(): boolean {
  const report = checkExportCompatibility();

  if (!report.canExport) {
    const message =
      `Video export is not supported in your browser.\n\n` +
      `Limitations:\n${report.limitations.join('\n')}\n\n` +
      `${report.recommendedBrowser ? `Please use: ${report.recommendedBrowser}` : ''}`;

    alert(message);
    return false;
  }

  if (report.warnings.length > 0) {
    console.warn('Export compatibility warnings:', report.warnings);
    // Allow user to proceed with warnings (non-blocking)
    return true;
  }

  return true;
}

/**
 * Get recommended video codec based on browser support
 */
export function getRecommendedCodec(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'video/webm'; // fallback
  }

  const codecs = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];

  for (const codec of codecs) {
    if (MediaRecorder.isTypeSupported(codec)) {
      return codec;
    }
  }

  return 'video/webm'; // ultimate fallback
}

/**
 * Log browser and feature support info for debugging
 */
export function logBrowserInfo(): void {
  if (typeof window === 'undefined') return;

  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    mediaRecorder: !!window.MediaRecorder,
    audioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
    canvasStream: typeof document.createElement('canvas').captureStream === 'function',
    recommendedCodec: getRecommendedCodec()
  });
}
