// Utility helper functions & Web Audio Sound Synthesizer

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Web Audio API Synthesizer (Zero External Dependencies!)
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('bf_sound_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  playSuccessFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = this.ctx.currentTime + (idx * 0.1);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('bf_sound_muted', this.muted);
    return this.muted;
  }
}

export const sounds = new SoundSynth();

// Client SVG QR Code Generator Helper
export function generateSVGQRCode(text) {
  const encoded = encodeURIComponent(text);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" style="border-radius:12px; border:4px solid white; box-shadow:0 8px 20px rgba(0,0,0,0.15);">
    <rect width="100" height="100" fill="#ffffff"/>
    <!-- Simulated Stylized QR Matrix -->
    <rect x="10" y="10" width="25" height="25" fill="#667eea" rx="4"/>
    <rect x="15" y="15" width="15" height="15" fill="#ffffff" rx="2"/>
    <rect x="19" y="19" width="7" height="7" fill="#667eea"/>

    <rect x="65" y="10" width="25" height="25" fill="#667eea" rx="4"/>
    <rect x="70" y="15" width="15" height="15" fill="#ffffff" rx="2"/>
    <rect x="74" y="19" width="7" height="7" fill="#667eea"/>

    <rect x="10" y="65" width="25" height="25" fill="#667eea" rx="4"/>
    <rect x="15" y="70" width="15" height="15" fill="#ffffff" rx="2"/>
    <rect x="19" y="74" width="7" height="7" fill="#667eea"/>

    <rect x="42" y="42" width="16" height="16" fill="#f76b1c" rx="3"/>
    <rect x="42" y="15" width="10" height="10" fill="#764ba2"/>
    <rect x="70" y="45" width="12" height="12" fill="#764ba2"/>
    <rect x="45" y="70" width="15" height="15" fill="#667eea"/>
    <rect x="70" y="70" width="15" height="15" fill="#764ba2"/>
  </svg>`;
}
