import { WeatherType } from '../types/pharmacy';
import { soundFX } from './sound';

/**
 * Procedural Web Audio Ambient Soundscape for VillageDiorama3D.
 * Synthesizes gentle bird chirps, spatial stream/pond water murmur,
 * rain patter, rolling wind gusts, and calm night crickets without external audio files.
 */
class VillageAmbientAudio {
  private running = false;
  private localMuted = false;
  private currentWeather: WeatherType = WeatherType.CERAH_HANGAT;
  private waterProximity = 0.25;

  private masterGain: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;

  private noiseSources: AudioBufferSourceNode[] = [];
  private lfoOscs: OscillatorNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;

  private birdTimer: number | null = null;
  private dropletTimer: number | null = null;
  private unsubMute: (() => void) | null = null;

  private getEffectiveGain(): number {
    return this.localMuted || soundFX.isMuted() ? 0 : 1;
  }

  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet pink-noise approximation for warm, organic ambient textures
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public start(initialWeather: WeatherType): void {
    this.currentWeather = initialWeather;
    if (this.running) {
      this.applyMix();
      return;
    }

    const ctx = soundFX.ensureContext();
    if (!ctx) return;

    this.running = true;
    if (!this.noiseBuffer) {
      this.noiseBuffer = this.createPinkNoiseBuffer(ctx);
    }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(this.getEffectiveGain(), now + 0.5);
    master.connect(ctx.destination);
    this.masterGain = master;

    // 1. Gentle Stream / Pond Water Murmur ("Gemericik Air")
    const waterSrc = ctx.createBufferSource();
    waterSrc.buffer = this.noiseBuffer;
    waterSrc.loop = true;

    const waterBand = ctx.createBiquadFilter();
    waterBand.type = 'bandpass';
    waterBand.frequency.setValueAtTime(680, now);
    waterBand.Q.setValueAtTime(1.15, now);

    const waterLfo = ctx.createOscillator();
    waterLfo.frequency.setValueAtTime(0.42, now);
    const waterLfoGain = ctx.createGain();
    waterLfoGain.gain.setValueAtTime(180, now);
    waterLfo.connect(waterLfoGain);
    waterLfoGain.connect(waterBand.frequency);
    waterLfo.start(now);

    const waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0.0001, now);

    waterSrc.connect(waterBand);
    waterBand.connect(waterGain);
    waterGain.connect(master);
    waterSrc.start(now);
    this.waterGain = waterGain;
    this.noiseSources.push(waterSrc);
    this.lfoOscs.push(waterLfo);

    // 2. Rain Patter ("Hujan Lembap")
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = this.noiseBuffer;
    rainSrc.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1450, now);
    rainFilter.Q.setValueAtTime(0.55, now);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.0001, now);

    rainSrc.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    rainSrc.start(now);
    this.rainGain = rainGain;
    this.noiseSources.push(rainSrc);

    // 3. Sweeping Wind Gusts ("Hembusan Angin")
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this.noiseBuffer;
    windSrc.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(360, now);
    windFilter.Q.setValueAtTime(2.4, now);

    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.18, now);
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(190, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start(now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.0001, now);

    windSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    windSrc.start(now);
    this.windGain = windGain;
    this.noiseSources.push(windSrc);
    this.lfoOscs.push(windLfo);

    this.unsubMute = soundFX.onMuteChange(() => {
      this.syncMasterMute();
    });

    this.applyMix();
    this.scheduleBirdOrCricket();
    this.scheduleWaterDroplet();
  }

  private syncMasterMute(): void {
    const ctx = soundFX.ensureContext();
    if (!ctx || !this.masterGain) {
      if (this.masterGain) {
        this.masterGain.gain.value = 0;
      }
      return;
    }
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.getEffectiveGain(), now, 0.08);
  }

  public setLocalMuted(mute: boolean): void {
    this.localMuted = mute;
    this.syncMasterMute();
  }

  public isLocalMuted(): boolean {
    return this.localMuted;
  }

  public setWeather(weather: WeatherType): void {
    this.currentWeather = weather;
    if (this.running) {
      this.applyMix();
    }
  }

  public setWaterProximity(proximity: number): void {
    this.waterProximity = Math.max(0, Math.min(1, proximity));
    if (this.running) {
      this.applyMix();
    }
  }

  private applyMix(): void {
    const ctx = soundFX.ensureContext();
    if (!ctx || !this.running) return;
    const now = ctx.currentTime;

    let targetWater = 0.05 + this.waterProximity * 0.14;
    let targetRain = 0.0001;
    let targetWind = 0.03;

    if (this.currentWeather === WeatherType.CERAH_HANGAT) {
      targetWater = 0.06 + this.waterProximity * 0.16;
      targetRain = 0.0001;
      targetWind = 0.04;
    } else if (this.currentWeather === WeatherType.HUJAN_LEMBAP) {
      targetWater = 0.1 + this.waterProximity * 0.14;
      targetRain = 0.22;
      targetWind = 0.06;
    } else if (this.currentWeather === WeatherType.ANGIN_PANCAROBA) {
      targetWater = 0.04 + this.waterProximity * 0.12;
      targetRain = 0.0001;
      targetWind = 0.24;
    } else if (this.currentWeather === WeatherType.KABUT_MALAM) {
      targetWater = 0.06 + this.waterProximity * 0.14;
      targetRain = 0.0001;
      targetWind = 0.07;
    }

    this.waterGain?.gain.setTargetAtTime(targetWater, now, 0.35);
    this.rainGain?.gain.setTargetAtTime(targetRain, now, 0.45);
    this.windGain?.gain.setTargetAtTime(targetWind, now, 0.45);
  }

  private playBirdChirpPhrase(): void {
    if (!this.running || this.getEffectiveGain() === 0) return;
    const ctx = soundFX.ensureContext();
    if (!ctx || !this.masterGain) return;

    const baseFreq = 1850 + Math.random() * 850;
    const notes = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < notes; i++) {
      const start = ctx.currentTime + i * (0.11 + Math.random() * 0.05);
      const dur = 0.075 + Math.random() * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const f1 = baseFreq + (Math.random() - 0.5) * 280;
      const f2 = f1 * (1.16 + Math.random() * 0.18);
      osc.frequency.setValueAtTime(f1, start);
      osc.frequency.exponentialRampToValueAtTime(f2, start + dur * 0.7);
      osc.frequency.exponentialRampToValueAtTime(f1 * 0.95, start + dur);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.022, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    }
  }

  private playNightCricketPulse(): void {
    if (!this.running || this.getEffectiveGain() === 0) return;
    const ctx = soundFX.ensureContext();
    if (!ctx || !this.masterGain) return;

    const freq = 3200 + Math.random() * 350;
    for (let i = 0; i < 3; i++) {
      const start = ctx.currentTime + i * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.011, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.055);
    }
  }

  private playWaterDropletBlip(): void {
    if (!this.running || this.getEffectiveGain() === 0) return;
    const ctx = soundFX.ensureContext();
    if (!ctx || !this.masterGain) return;

    const isRain = this.currentWeather === WeatherType.HUJAN_LEMBAP;
    if (!isRain && this.waterProximity < 0.25) return;

    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const fStart = 520 + Math.random() * 480;
    osc.frequency.setValueAtTime(fStart, start);
    osc.frequency.exponentialRampToValueAtTime(fStart * 1.85, start + 0.048);

    const vol = isRain ? 0.016 : 0.014 * this.waterProximity;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + 0.065);
  }

  private scheduleBirdOrCricket(): void {
    if (!this.running) return;
    if (this.currentWeather === WeatherType.CERAH_HANGAT) {
      this.playBirdChirpPhrase();
    } else if (this.currentWeather === WeatherType.ANGIN_PANCAROBA && Math.random() < 0.45) {
      this.playBirdChirpPhrase();
    } else if (this.currentWeather === WeatherType.KABUT_MALAM) {
      this.playNightCricketPulse();
    }

    const delay =
      this.currentWeather === WeatherType.CERAH_HANGAT
        ? 2400 + Math.random() * 2600
        : 2200 + Math.random() * 2400;
    this.birdTimer = window.setTimeout(() => this.scheduleBirdOrCricket(), delay);
  }

  private scheduleWaterDroplet(): void {
    if (!this.running) return;
    this.playWaterDropletBlip();
    const delay =
      this.currentWeather === WeatherType.HUJAN_LEMBAP
        ? 260 + Math.random() * 420
        : 900 + Math.random() * 1400;
    this.dropletTimer = window.setTimeout(() => this.scheduleWaterDroplet(), delay);
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.birdTimer !== null) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.dropletTimer !== null) {
      clearTimeout(this.dropletTimer);
      this.dropletTimer = null;
    }
    if (this.unsubMute) {
      this.unsubMute();
      this.unsubMute = null;
    }

    this.noiseSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // already stopped
      }
    });
    this.noiseSources = [];

    this.lfoOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.lfoOscs = [];

    this.masterGain?.disconnect();
    this.masterGain = null;
    this.waterGain = null;
    this.rainGain = null;
    this.windGain = null;
  }
}

export const villageAmbientAudio = new VillageAmbientAudio();
