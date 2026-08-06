import { API } from './api.js';
import { CountdownTimer } from './timer.js';
import { showToast } from './app.js';
import { sounds, getQueryParam, escapeHtml } from './utils.js';

class QuizEngine {
  constructor() {
    this.roomId = getQueryParam('room');
    this.userId = localStorage.getItem(`bf_user_${this.roomId}`);
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.timer = null;
    this.isSubmitting = false;
  }

  async init() {
    if (!this.roomId || !this.userId) {
      showToast('Missing room session details. Redirecting...', 'error');
      setTimeout(() => window.location.href = 'index.html', 2000);
      return;
    }

    try {
      const data = await API.getRoomQuestions(this.roomId);
      this.questions = data.questions;
      
      if (!this.questions || this.questions.length === 0) {
        showToast('No questions found for this room.', 'error');
        return;
      }

      this.renderCurrentQuestion();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  renderCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    const cardContainer = document.getElementById('quiz-card-container');
    const progressBar = document.getElementById('progress-fill');
    const questionCounter = document.getElementById('question-counter');

    if (!q || !cardContainer) return;

    // Update Progress
    const pct = ((this.currentIndex + 1) / this.questions.length) * 100;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (questionCounter) questionCounter.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;

    // Render Options based on type
    let optionsHTML = '';

    if (q.type === 'mcq') {
      optionsHTML = `<div class="option-btn-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1.5rem;">
        ${q.options.map(opt => `
          <button class="btn btn-secondary option-btn" data-value="${escapeHtml(opt)}" style="padding:1.2rem; text-align:left; justify-content:flex-start;">
            🔘 ${escapeHtml(opt)}
          </button>
        `).join('')}
      </div>`;
    } else if (q.type === 'tf') {
      const opts = q.options && q.options.length === 2 ? q.options : ['True', 'False'];
      optionsHTML = `<div class="option-btn-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-top:1.5rem;">
        <button class="btn btn-secondary option-btn" data-value="${escapeHtml(opts[0])}" style="padding:1.5rem; font-size:1.2rem;">
          ${escapeHtml(opts[0])}
        </button>
        <button class="btn btn-secondary option-btn" data-value="${escapeHtml(opts[1])}" style="padding:1.5rem; font-size:1.2rem;">
          ${escapeHtml(opts[1])}
        </button>
      </div>`;
    } else if (q.type === 'text') {
      optionsHTML = `<div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <input type="text" id="text-answer-input" class="form-control" placeholder="Type your answer here..." style="font-size:1.1rem; padding:1.2rem;" />
        <button id="submit-text-btn" class="btn btn-primary" style="align-self:flex-end;">Submit Answer 🔒</button>
      </div>`;
    } else if (q.type === 'emoji') {
      const emojis = q.options && q.options.length > 0 ? q.options : ['😍', '🔥', '🥳', '😎', '💀'];
      optionsHTML = `<div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
        ${emojis.map(e => `
          <button class="avatar-item option-btn" data-value="${escapeHtml(e)}" style="width:65px; height:65px; font-size:2.2rem;">
            ${escapeHtml(e)}
          </button>
        `).join('')}
      </div>`;
    } else if (q.type === 'rating') {
      optionsHTML = `<div style="margin-top:1.5rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-weight:700;">
          <span>1 (Low)</span>
          <span id="rating-val-display" style="font-size:1.4rem; color:var(--primary-color);">5</span>
          <span>10 (High)</span>
        </div>
        <input type="range" id="rating-slider" min="1" max="10" value="5" class="form-control" style="cursor:pointer;" />
        <button id="submit-rating-btn" class="btn btn-primary" style="margin-top:1.5rem; width:100%;">Lock Rating 🔒</button>
      </div>`;
    }

    cardContainer.innerHTML = `
      <div class="glass-card fade-in" style="position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <span class="badge" style="background:var(--primary-color); color:white; padding:0.3rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.85rem;">
            ${escapeHtml(q.category || 'Challenge')}
          </span>
          <div id="timer-box"></div>
        </div>

        <h2 style="font-size:1.5rem; font-weight:800; margin:1rem 0;">${escapeHtml(q.text)}</h2>

        ${optionsHTML}
      </div>
    `;

    // Start 30s Countdown Timer
    const timerBox = document.getElementById('timer-box');
    this.timer = new CountdownTimer(
      30,
      timerBox,
      null,
      () => this.handleTimeout()
    );
    this.timer.start();

    // Attach Event Listeners
    this.bindEvents(q);
  }

  bindEvents(q) {
    // MCQ, T/F, Emoji option click
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.getAttribute('data-value');
        this.submitAnswer(q.id, q.type, val);
      });
    });

    // Text Answer
    const submitTextBtn = document.getElementById('submit-text-btn');
    if (submitTextBtn) {
      submitTextBtn.addEventListener('click', () => {
        const input = document.getElementById('text-answer-input');
        const val = input ? input.value.trim() : '';
        if (!val) {
          showToast('Please type an answer before submitting.', 'error');
          return;
        }
        this.submitAnswer(q.id, q.type, val);
      });
    }

    // Rating Slider
    const ratingSlider = document.getElementById('rating-slider');
    const ratingDisplay = document.getElementById('rating-val-display');
    if (ratingSlider && ratingDisplay) {
      ratingSlider.addEventListener('input', (e) => {
        ratingDisplay.textContent = e.target.value;
      });
    }
    const submitRatingBtn = document.getElementById('submit-rating-btn');
    if (submitRatingBtn) {
      submitRatingBtn.addEventListener('click', () => {
        const val = ratingSlider ? ratingSlider.value : '5';
        this.submitAnswer(q.id, q.type, val);
      });
    }
  }

  async handleTimeout() {
    showToast('Time expired! Auto-submitting default response...', 'info');
    const q = this.questions[this.currentIndex];
    let fallback = 'No Answer';
    if (q.type === 'rating') fallback = '5';
    if (q.type === 'tf') fallback = 'True';
    await this.submitAnswer(q.id, q.type, fallback);
  }

  async submitAnswer(qId, qType, answerText) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    if (this.timer) this.timer.stop();

    sounds.playClick();

    try {
      // Send answer to backend
      await API.submitAnswer({
        room_id: this.roomId,
        user_id: this.userId,
        question_id: qId,
        question_type: qType,
        answer_text: String(answerText)
      });

      this.userAnswers[qId] = answerText;

      // Lock confirmation animation
      showToast('Answer locked permanently! 🔒', 'success');

      // Next Question or Finish
      this.currentIndex++;
      this.isSubmitting = false;

      if (this.currentIndex < this.questions.length) {
        this.renderCurrentQuestion();
      } else {
        await this.finishQuiz();
      }
    } catch (e) {
      this.isSubmitting = false;
      showToast(e.message, 'error');
    }
  }

  async finishQuiz() {
    sounds.playSuccessFanfare();
    const cardContainer = document.getElementById('quiz-card-container');
    cardContainer.innerHTML = `
      <div class="glass-card text-center fade-in" style="padding:3rem 2rem;">
        <div class="spinner" style="margin:0 auto 1.5rem auto;"></div>
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.8rem;">Answers Locked! 🔒</h2>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">
          Waiting for your friend to complete the challenge. Results will be revealed instantly when both finish!
        </p>
        <div style="background:rgba(102, 126, 234, 0.1); padding:1rem; border-radius:12px; font-weight:600;">
          Status: Polling partner status...
        </div>
      </div>
    `;

    try {
      await API.finishQuiz(this.roomId, this.userId);
      this.startResultsPolling();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  startResultsPolling() {
    const pollInterval = setInterval(async () => {
      try {
        const res = await API.getResults(this.roomId);
        if (res.status === 'COMPLETED') {
          clearInterval(pollInterval);
          window.location.href = `result.html?room=${this.roomId}`;
        }
      } catch (e) {}
    }, 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const engine = new QuizEngine();
  engine.init();
});
