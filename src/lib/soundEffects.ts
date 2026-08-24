// High-precision Web Audio API Sound Engine
// Zero external audio files, zero latency, ultra-lightweight ASMR micro-interactions

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("voidwallz_sfx_muted");
      // Default to unmuted (sound on) or restore user preference
      this.isMuted = stored === "true";
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("voidwallz_sfx_muted", String(this.isMuted));
      window.dispatchEvent(new Event("voidwallz-sfx-toggled"));
    }
    if (!this.isMuted) {
      this.playSwitch();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // 1. Subtle Tactile Tap (Tabs, Filter Pills, Buttons)
  public playTap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (_) {}
  }

  // 2. Mechanical Switch (Atmosphere Mode FX, View Toggles)
  public playSwitch() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Pulse 1: Mechanical click
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(800, t);
      osc1.frequency.exponentialRampToValueAtTime(200, t + 0.03);
      gain1.gain.setValueAtTime(0.08, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.035);

      // Pulse 2: Resonant latch body (15ms after)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1600, t + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(600, t + 0.045);
      gain2.gain.setValueAtTime(0.06, t + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.015);
      osc2.stop(t + 0.055);
    } catch (_) {}
  }

  // 3. Resonant Glass Harmonic Pop (Like / Favorite)
  public playLike() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = [880, 1320]; // Harmonic A5 + E6

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + i * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.18);

        gain.gain.setValueAtTime(0.07 / (i + 1), t + i * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + i * 0.02);
        osc.stop(t + 0.23);
      });
    } catch (_) {}
  }

  // 4. Precision Camera Shutter Snap (Download Master & Packs)
  public playShutter() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      // Blade click
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(2400, t);
      osc1.frequency.exponentialRampToValueAtTime(400, t + 0.04);
      gain1.gain.setValueAtTime(0.09, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.05);

      // Aperture release (28ms delay)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(900, t + 0.028);
      osc2.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      gain2.gain.setValueAtTime(0.12, t + 0.028);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.028);
      osc2.stop(t + 0.095);
    } catch (_) {}
  }

  // 5. Ambient Modal Open (Expand Artwork Stage)
  public playOpenModal() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.12);

      osc.type = "sine";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.14);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.17);
    } catch (_) {}
  }

  // 6. Modal Close Release
  public playClose() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.08);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.095);
    } catch (_) {}
  }

  // 7. Shimmering Dopamine Success Chime (Download Finished / Pack Saved)
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // 3-chord harmonic progression: E5 -> G#5 -> B5 with shimmering E6 top bell
      const arpeggio = [
        { freq: 659.25, time: t + 0.0, dur: 0.22, vol: 0.06 }, // E5
        { freq: 830.61, time: t + 0.055, dur: 0.24, vol: 0.07 }, // G#5
        { freq: 987.77, time: t + 0.11, dur: 0.32, vol: 0.08 }, // B5
        { freq: 1318.5, time: t + 0.12, dur: 0.35, vol: 0.05 }, // E6 Shimmer
      ];

      arpeggio.forEach((note) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, note.time);

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, note.time);
        osc.frequency.exponentialRampToValueAtTime(note.freq * 1.02, note.time + note.dur);

        gain.gain.setValueAtTime(note.vol, note.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(note.time);
        osc.stop(note.time + note.dur + 0.01);
      });
    } catch (_) {}
  }
}

export const sound = new SoundEngine();
