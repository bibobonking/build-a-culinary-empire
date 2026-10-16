/**
 * Cozy Web Audio Synthesizer
 * Generates warm, gentle Lo-Fi / Jazz chords and tactile cooking SFX
 * Completely client-side with zero external assets
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private chordIndex = 0;
  public isMuted = false;
  public volume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.4 * this.volume, this.ctx.currentTime);

      this.bgmGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22 * this.volume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4 * this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  // --- LO-FI / COZY JAZZ BGM SYNTHESIZER ---
  private chords: number[][] = [
    [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
    [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
    [293.66, 349.23, 440.00, 523.25, 587.33], // Dm9
    [196.00, 261.63, 329.63, 392.00, 440.00], // G13sus
    [174.61, 261.63, 329.63, 392.00, 523.25], // Fmaj7
    [220.00, 293.66, 349.23, 440.00, 523.25], // Dm7
    [246.94, 329.63, 392.00, 493.88, 587.33], // Em7
    [196.00, 246.94, 293.66, 370.00, 440.00], // Gmaj9
  ];

  public startBgm() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.scheduleNextChord();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public getBgmStatus() {
    return this.isBgmPlaying;
  }

  private playWarmNote(freq: number, startTime: number, duration: number, velocity: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, startTime);
    filter.frequency.exponentialRampToValueAtTime(320, startTime + duration);

    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.15, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Bass line ấm áp cho BGM (sine + lowpass sâu)
  private playBassNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, startTime);
    g.gain.setValueAtTime(0.001, startTime);
    g.gain.linearRampToValueAtTime(0.11, startTime + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.bgmGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Melody lấp lánh nhẹ phía trên hợp âm
  private playMelodyNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, startTime);
    g.gain.setValueAtTime(0.001, startTime);
    g.gain.linearRampToValueAtTime(0.055, startTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.bgmGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Root notes (octave dưới) cho bass line
  private bassRoots = [130.81, 110.0, 146.83, 98.0, 87.31, 146.83, 164.81, 98.0]; // C3 A2 D3 G2 F2 D3 E3 G2

  private scheduleNextChord() {
    if (!this.isBgmPlaying || !this.ctx) return;

    const idx = this.chordIndex % this.chords.length;
    const chord = this.chords[idx];
    const now = this.ctx.currentTime;
    const chordDuration = 3.8;

    chord.forEach((freq, i) => {
      const delay = i * 0.065 + Math.random() * 0.02;
      const vel = 0.7 - i * 0.08;
      this.playWarmNote(freq, now + delay, chordDuration - delay, vel);
    });

    // Bass + melody ngẫu nhiên để BGM có chiều sâu & sinh động hơn
    this.playBassNote(this.bassRoots[idx % this.bassRoots.length], now + 0.1, chordDuration - 0.4);
    for (let beat = 0; beat < 3; beat++) {
      if (Math.random() < 0.65) {
        const note = chord[1 + Math.floor(Math.random() * (chord.length - 1))];
        this.playMelodyNote(note * 2, now + 0.6 + beat * 1.1, 0.9);
      }
    }

    this.chordIndex++;
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextChord();
    }, (chordDuration - 0.2) * 1000);
  }

  // --- SOUND EFFECTS ---

  // Button pop / wood tap
  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Sizzling kitchen cook sound
  public playCookSizzle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  public playCooking() {
    this.playCookSizzle();
  }

  // Cảnh báo nhẹ nhàng, dễ thương (không chói tai)
  public playWarning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(196, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  public playError() {
    this.playWarning();
  }

  // Order ready / Bell ding
  public playBellDing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc2.frequency.setValueAtTime(1760, this.ctx.currentTime); // A6

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.8);
    osc2.stop(this.ctx.currentTime + 0.8);
  }

  // Cash register / coin chime (ting-ting!)
  public playCashRegister() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [987.77, 1318.51, 1975.53]; // B5, E6, B6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = this.ctx!.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // 5-Star / Milestone Fanfare chime
  public playCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = this.ctx!.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  // Gacha reveal: chuỗi nốt vui nhộn tăng dần theo độ hiếm
  // Secret có riêng đoạn "phép thuật" lấp lánh dài hơn — chỉ Secret được hưởng hiệu ứng đặc biệt này
  public playGachaReveal(rarity?: string | null) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const key = rarity || 'Rare';
    const ladder: Record<string, number[]> = {
      Rare: [523.25, 659.25], // C5 E5
      Epic: [523.25, 659.25, 783.99], // C5 E5 G5
      Legendary: [523.25, 659.25, 783.99, 1046.5], // + C6
      Mythical: [440.0, 554.37, 659.25, 880.0, 1108.73], // A maj攀升
      Secret: [523.25, 622.25, 739.99, 932.33, 1108.73, 1244.51, 1479.98], // ma thuật lấp lánh
    };
    const notes = ladder[key] || ladder.Rare;
    const step = key === 'Secret' ? 0.1 : 0.085;

    notes.forEach((freq, idx) => {
      const startTime = this.ctx!.currentTime + idx * step;
      const osc = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime); // octave shimmer
      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + 0.45);
      osc2.stop(startTime + 0.45);
    });

    // Secret: thêm "cánh hoa sao" kết thúc bằng nốt réng dài
    if (key === 'Secret') {
      const t = this.ctx.currentTime + notes.length * step + 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1567.98, t); // G6
      osc.frequency.exponentialRampToValueAtTime(2093.0, t + 0.5);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.9);
    }
  }
}

export const sound = new SoundEngine();
export const SoundManager = SoundEngine;
