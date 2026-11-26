class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private muteListeners: Set<(muted: boolean) => void> = new Set();

  public ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    this.muteListeners.forEach((cb) => cb(mute));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public onMuteChange(cb: (muted: boolean) => void): () => void {
    this.muteListeners.add(cb);
    return () => {
      this.muteListeners.delete(cb);
    };
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.08,
    delay: number = 0,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(540, 0.06, 'triangle', 0.05, 0, 420);
  }

  public playDialogBlip(pitchOffset: number = 0): void {
    this.playTone(380 + pitchOffset, 0.04, 'sine', 0.03, 0, 410 + pitchOffset);
  }

  public playSuccess(): void {
    this.playTone(523.25, 0.14, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.09);
    this.playTone(783.99, 0.24, 'sine', 0.09, 0.18);
  }

  public playError(): void {
    this.playTone(220, 0.16, 'sawtooth', 0.05, 0, 165);
    this.playTone(175, 0.22, 'sawtooth', 0.05, 0.12, 130);
  }

  public playPlaceTower(): void {
    this.playTone(320, 0.1, 'triangle', 0.07, 0, 480);
  }

  public playShoot(): void {
    this.playTone(680, 0.05, 'sine', 0.025, 0, 340);
  }

  public playResistanceAlert(): void {
    this.playTone(300, 0.18, 'square', 0.05, 0, 260);
    this.playTone(260, 0.24, 'square', 0.05, 0.2, 180);
  }
}

export const soundFX = new SoundEngine();
