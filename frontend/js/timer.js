import { sounds } from './utils.js';

export class CountdownTimer {
  constructor(durationSeconds, containerElement, onTick, onExpire) {
    this.duration = durationSeconds;
    this.remaining = durationSeconds;
    this.container = containerElement;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
    this.isPaused = false;
  }

  renderSVG() {
    return `
      <div class="timer-wrapper" style="position:relative; width:80px; height:80px; display:inline-flex; align-items:center; justify-content:center;">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
          <circle id="timer-ring" cx="50" cy="50" r="42" fill="none" stroke="#10b981" stroke-width="8"
            stroke-dasharray="264" stroke-dashoffset="0" stroke-linecap="round"
            transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s linear, stroke 0.3s ease;" />
        </svg>
        <span id="timer-text" style="position:absolute; font-weight:800; font-size:1.4rem; color:var(--text-main);">
          ${this.remaining}
        </span>
      </div>
    `;
  }

  start() {
    this.stop();
    this.remaining = this.duration;
    if (this.container) {
      this.container.innerHTML = this.renderSVG();
    }

    this.intervalId = setInterval(() => {
      if (this.isPaused) return;

      this.remaining--;

      const textEl = document.getElementById('timer-text');
      const ringEl = document.getElementById('timer-ring');

      if (textEl) textEl.textContent = this.remaining;

      if (ringEl) {
        const strokeOffset = 264 - (264 * (this.remaining / this.duration));
        ringEl.style.strokeDashoffset = strokeOffset;

        // Warning Colors
        if (this.remaining <= 5) {
          ringEl.style.stroke = '#ef4444'; // Red alert
          sounds.playTick();
        } else if (this.remaining <= 10) {
          ringEl.style.stroke = '#f59e0b'; // Amber warning
          sounds.playTick();
        } else {
          ringEl.style.stroke = '#10b981'; // Green normal
        }
      }

      if (this.onTick) this.onTick(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        if (this.onExpire) this.onExpire();
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
