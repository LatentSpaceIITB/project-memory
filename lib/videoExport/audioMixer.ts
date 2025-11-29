export class AudioMixer {
  private audioContext: AudioContext;
  private destination: MediaStreamAudioDestinationNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.destination = this.audioContext.createMediaStreamDestination();
  }

  /**
   * Creates sequenced audio where creator plays first, then friend
   * Phase 1 (0 → creator duration): Creator audio ON, friend MUTED
   * Phase 2 (creator end → total): Creator MUTED, friend audio ON
   * 0.3s crossfade transition between phases
   */
  createSequencedAudio(
    creatorVideo: HTMLVideoElement,
    friendVideo: HTMLVideoElement
  ): MediaStream {
    const creatorDuration = creatorVideo.duration;

    // Create audio sources from video elements
    const creatorSource = this.audioContext.createMediaElementSource(creatorVideo);
    const friendSource = this.audioContext.createMediaElementSource(friendVideo);

    // Create gain nodes for volume control
    const creatorGain = this.audioContext.createGain();
    const friendGain = this.audioContext.createGain();

    // Phase 1: Creator audio ON (1.0), Friend audio OFF (0)
    creatorGain.gain.setValueAtTime(1.0, 0);
    friendGain.gain.setValueAtTime(0, 0);

    // Transition at creator end with 0.3s crossfade
    const crossfadeDuration = 0.3;
    creatorGain.gain.setValueAtTime(1.0, creatorDuration);
    creatorGain.gain.linearRampToValueAtTime(0, creatorDuration + crossfadeDuration);

    friendGain.gain.setValueAtTime(0, creatorDuration);
    friendGain.gain.linearRampToValueAtTime(1.0, creatorDuration + crossfadeDuration);

    // Connect audio graph: source → gain → destination
    creatorSource.connect(creatorGain).connect(this.destination);
    friendSource.connect(friendGain).connect(this.destination);

    return this.destination.stream;
  }

  cleanup(): void {
    this.audioContext.close();
  }
}
