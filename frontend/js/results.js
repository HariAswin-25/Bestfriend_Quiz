import { API } from './api.js';
import { showToast } from './app.js';
import { sounds, getQueryParam, escapeHtml } from './utils.js';

class ResultsManager {
  constructor() {
    this.roomId = getQueryParam('room');
    this.resultData = null;
  }

  async init() {
    if (!this.roomId) {
      window.location.href = 'index.html';
      return;
    }

    try {
      this.resultData = await API.getResults(this.roomId);
      if (this.resultData.status === 'WAITING_FOR_PARTNER') {
        showToast('Partner has not finished yet. Redirecting...', 'info');
        setTimeout(() => window.location.href = `quiz.html?room=${this.roomId}`, 2000);
        return;
      }

      this.renderResults();
      this.triggerConfetti();
      sounds.playSuccessFanfare();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  renderResults() {
    const data = this.resultData;

    // Avatars & Names
    const p1Avatar = document.getElementById('res-p1-avatar');
    const p1Name = document.getElementById('res-p1-name');
    const p2Avatar = document.getElementById('res-p2-avatar');
    const p2Name = document.getElementById('res-p2-name');

    if (p1Avatar) p1Avatar.textContent = data.creator_avatar;
    if (p1Name) p1Name.textContent = data.creator_name;
    if (p2Avatar) p2Avatar.textContent = data.friend_avatar;
    if (p2Name) p2Name.textContent = data.friend_name;

    // Winner & Achievement
    const winnerEl = document.getElementById('res-winner-text');
    const achievementEl = document.getElementById('res-achievement-badge');
    if (winnerEl) winnerEl.textContent = `Winner: ${data.winner_name}`;
    if (achievementEl) achievementEl.textContent = data.achievement;

    // Match Stats
    const matchedEl = document.getElementById('res-matched-count');
    const totalEl = document.getElementById('res-total-count');
    if (matchedEl) matchedEl.textContent = data.matched_answers;
    if (totalEl) totalEl.textContent = data.total_questions;

    // Counter Animation for Match Percentage
    this.animateCounter('res-percentage-text', data.match_percentage);

    // Breakdown Table Cards (with responsive breakdown-card-grid class)
    const breakdownContainer = document.getElementById('res-breakdown-list');
    if (breakdownContainer && data.breakdown) {
      breakdownContainer.innerHTML = data.breakdown.map((item, idx) => `
        <div class="glass-card fade-in" style="padding:1.2rem; margin-bottom:1rem; border-left:6px solid ${item.is_match ? '#10b981' : '#ef4444'};">
          <div style="font-weight:700; font-size:1.05rem; margin-bottom:0.8rem; color:var(--text-main);">
            Q${idx+1}: ${escapeHtml(item.question_text)}
          </div>
          <div class="breakdown-card-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div style="background:rgba(255,255,255,0.12); padding:0.8rem; border-radius:8px; border:1px solid var(--card-border);">
              <span style="font-size:0.85rem; color:var(--text-muted); display:block;">${escapeHtml(data.creator_name)}:</span>
              <strong style="font-size:1.05rem; color:var(--text-main);">${escapeHtml(item.creator_answer)}</strong>
            </div>
            <div style="background:rgba(255,255,255,0.12); padding:0.8rem; border-radius:8px; border:1px solid var(--card-border);">
              <span style="font-size:0.85rem; color:var(--text-muted); display:block;">${escapeHtml(data.friend_name)}:</span>
              <strong style="font-size:1.05rem; color:var(--text-main);">${escapeHtml(item.friend_answer)}</strong>
            </div>
          </div>
          <div style="margin-top:0.6rem; text-align:right; font-weight:800; font-size:0.9rem; color:${item.is_match ? '#10b981' : '#ef4444'};">
            ${item.is_match ? 'MATCH! ✨' : 'DIFFERENT ❌'}
          </div>
        </div>
      `).join('');
    }

    // Bind Certificate Generator Button
    const certBtn = document.getElementById('download-cert-btn');
    if (certBtn) {
      certBtn.addEventListener('click', () => this.generateCertificate());
    }

    // Bind Share Button
    const shareBtn = document.getElementById('share-res-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `We scored ${data.match_percentage}% compatibility on Best Friend Challenge! Result: ${data.achievement}`;
        if (navigator.share) {
          navigator.share({ title: 'Best Friend Challenge Result', text, url: window.location.href });
        } else {
          navigator.clipboard.writeText(text);
          showToast('Results copied to clipboard! 📋', 'success');
        }
      });
    }
  }

  animateCounter(elementId, targetVal) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let current = 0;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = targetVal / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetVal) {
        current = targetVal;
        clearInterval(timer);
      }
      el.textContent = `${current.toFixed(1)}%`;
    }, stepTime);
  }

  triggerConfetti() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const colors = ['#6366f1', '#ec4899', '#f76b1c', '#10b981', '#f59e0b', '#14b8a6'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = `${Math.random() * 10 + 6}px`;
      p.style.height = `${Math.random() * 10 + 6}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `-20px`;
      p.style.borderRadius = '50%';
      p.style.transition = `transform ${Math.random() * 2 + 2}s ease-out, opacity ${Math.random() * 2 + 2}s ease-out`;

      container.appendChild(p);

      setTimeout(() => {
        p.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = '0';
      }, 50);
    }

    setTimeout(() => container.remove(), 4000);
  }

  generateCertificate() {
    const data = this.resultData;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 900, 600);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 600);

    // Inner Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 860, 560);

    // Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BEST FRIEND COMPATIBILITY CERTIFICATE', 450, 90);

    ctx.font = '24px sans-serif';
    ctx.fillText('This certifies that', 450, 150);

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#ffedd5';
    ctx.fillText(`${data.creator_name}  &  ${data.friend_name}`, 450, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Achieved a Compatibility Match of`, 450, 290);

    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${data.match_percentage}%`, 450, 370);

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Official Title: ${data.achievement}`, 450, 440);

    ctx.font = '18px sans-serif';
    ctx.fillText(`Verified by Best Friend Challenge App • ${new Date().toLocaleDateString()}`, 450, 520);

    // Download PNG
    const link = document.createElement('a');
    link.download = `BestFriend_Certificate_${data.creator_name}_${data.friend_name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Certificate downloaded! 🏆', 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mgr = new ResultsManager();
  mgr.init();
});
