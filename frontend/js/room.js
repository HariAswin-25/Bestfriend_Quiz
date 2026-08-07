import { API } from './api.js';
import { showToast } from './app.js';
import { sounds, generateSVGQRCode, getQueryParam, escapeHtml } from './utils.js';

// Room & Lobby Controller Module
export class RoomManager {
  static initCreatePage() {
    let selectedQuestionIds = [];
    let customQuestionsList = [];
    let defaultQuestionsBank = [];

    // Avatar selector logic
    let selectedAvatar = '😊';
    document.querySelectorAll('#avatar-picker .avatar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('#avatar-picker .avatar-item').forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
        selectedAvatar = e.currentTarget.getAttribute('data-avatar');
      });
    });

    const fallbackQuestions = [
      { id: "q1", text: "What is my absolute favorite food?", category: "Food", type: "mcq", options: ["Pizza", "Sushi", "Tacos", "Burgers"] },
      { id: "q2", text: "Tea or Coffee?", category: "Food", type: "tf", options: ["Tea 🍵", "Coffee ☕"] },
      { id: "q3", text: "What is my go-to pizza topping?", category: "Food", type: "mcq", options: ["Extra Cheese", "Pepperoni", "Mushrooms", "Pineapple"] },
      { id: "q4", text: "Am I a morning person or a night owl?", category: "Lifestyle", type: "tf", options: ["Morning Bird 🌅", "Night Owl 🦉"] },
      { id: "q5", text: "Cats or Dogs?", category: "Lifestyle", type: "tf", options: ["Cats 🐱", "Dogs 🐶"] }
    ];

    // Fetch Question Library for Picker
    async function loadQuestionLibrary() {
      try {
        defaultQuestionsBank = await API.getQuestionLibrary();
        if (!defaultQuestionsBank || defaultQuestionsBank.length === 0) {
          defaultQuestionsBank = fallbackQuestions;
        }
      } catch (e) {
        console.warn('Backend server offline or CORS restriction. Using fallback question library.', e);
        defaultQuestionsBank = fallbackQuestions;
      }

      // Auto pre-select first 5 default questions if none selected yet
      if (selectedQuestionIds.length === 0 && defaultQuestionsBank.length > 0) {
        selectedQuestionIds = defaultQuestionsBank.slice(0, 5).map(q => q.id);
      }
      renderQuestionLibrary(defaultQuestionsBank);
      updateQuestionCounter();
    }

    function renderQuestionLibrary(questions) {
      const container = document.getElementById('question-library-list');
      if (!container) return;

      container.innerHTML = questions.map(q => {
        const isChecked = selectedQuestionIds.includes(q.id);
        return `
        <div class="glass-card question-library-item" data-id="${q.id}" style="padding:1rem; margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div>
            <span class="badge" style="font-size:0.75rem; background:rgba(102,126,234,0.2); color:var(--primary-color); padding:0.2rem 0.5rem; border-radius:6px;">${escapeHtml(q.category)}</span>
            <p style="font-weight:600; margin-top:0.3rem;">${escapeHtml(q.text)}</p>
          </div>
          <input type="checkbox" class="q-checkbox" data-id="${q.id}" ${isChecked ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
        </div>
      `;
      }).join('');

      // Make clicking the card toggle the checkbox
      container.querySelectorAll('.question-library-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.tagName.toLowerCase() === 'input') return;
          const cb = item.querySelector('.q-checkbox');
          if (cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
          }
        });
      });

      // Checkbox event binding
      container.querySelectorAll('.q-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-id');
          if (e.target.checked) {
            if (!selectedQuestionIds.includes(id)) selectedQuestionIds.push(id);
          } else {
            selectedQuestionIds = selectedQuestionIds.filter(x => x !== id);
          }
          updateQuestionCounter();
        });
      });
    }

    function updateQuestionCounter() {
      const counter = document.getElementById('selected-q-count');
      if (counter) {
        const total = selectedQuestionIds.length + customQuestionsList.length;
        counter.textContent = `${total} Questions Selected`;
      }
    }

    // Search and Filter Question Library
    const searchInput = document.getElementById('q-search-input');
    const filterCategory = document.getElementById('q-category-filter');
    
    function filterLibrary() {
      const term = searchInput ? searchInput.value.toLowerCase() : '';
      const cat = filterCategory ? filterCategory.value : 'ALL';
      
      const filtered = defaultQuestionsBank.filter(q => {
        const matchText = q.text.toLowerCase().includes(term);
        const matchCat = cat === 'ALL' || q.category === cat;
        return matchText && matchCat;
      });

      renderQuestionLibrary(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filterLibrary);
    if (filterCategory) filterCategory.addEventListener('change', filterLibrary);

    // Custom Question Form Adder
    const addCustomBtn = document.getElementById('add-custom-q-btn');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', () => {
        const qText = document.getElementById('custom-q-text')?.value.trim();
        const qType = document.getElementById('custom-q-type')?.value;
        
        if (!qText) {
          showToast('Please enter question text.', 'error');
          return;
        }

        let options = [];
        if (qType === 'mcq') {
          const opt1 = document.getElementById('opt1')?.value.trim() || 'Option A';
          const opt2 = document.getElementById('opt2')?.value.trim() || 'Option B';
          const opt3 = document.getElementById('opt3')?.value.trim() || 'Option C';
          const opt4 = document.getElementById('opt4')?.value.trim() || 'Option D';
          options = [opt1, opt2, opt3, opt4];
        }

        customQuestionsList.push({ text: qText, type: qType, options });
        showToast('Custom question added!', 'success');
        
        // Reset form
        if (document.getElementById('custom-q-text')) document.getElementById('custom-q-text').value = '';
        renderCustomQuestionsList();
        updateQuestionCounter();
      });
    }

    function renderCustomQuestionsList() {
      const listEl = document.getElementById('custom-q-list');
      if (!listEl) return;
      listEl.innerHTML = customQuestionsList.map((cq, idx) => `
        <div style="background:rgba(255,255,255,0.15); padding:0.8rem 1.2rem; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
          <span><strong>Q${idx+1}:</strong> ${escapeHtml(cq.text)} (${cq.type.toUpperCase()})</span>
          <button class="btn btn-outline" data-idx="${idx}" style="padding:0.2rem 0.6rem; font-size:0.8rem;">Remove</button>
        </div>
      `).join('');

      listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          customQuestionsList.splice(idx, 1);
          renderCustomQuestionsList();
          updateQuestionCounter();
        });
      });
    }

    // Submit Create Challenge
    const submitCreateBtn = document.getElementById('submit-create-btn');
    if (submitCreateBtn) {
      submitCreateBtn.addEventListener('click', async () => {
        const creatorName = document.getElementById('creator-name-input')?.value.trim();
        const challengeTitle = document.getElementById('challenge-title-input')?.value.trim() || 'Best Friend Challenge';

        if (!creatorName) {
          showToast('Please enter your name.', 'error');
          return;
        }

        try {
          const res = await API.createRoom({
            creator_name: creatorName,
            creator_avatar: selectedAvatar,
            title: challengeTitle,
            question_ids: selectedQuestionIds,
            custom_questions: customQuestionsList
          });

          // Save user & room session locally
          localStorage.setItem(`bf_user_${res.room_id}`, res.creator_id);
          localStorage.setItem(`bf_role_${res.room_id}`, 'creator');

          showToast('Challenge Created! Redirecting to waiting room...', 'success');
          setTimeout(() => {
            window.location.href = `waiting.html?room=${res.room_id}`;
          }, 1200);
        } catch (e) {
          showToast(e.message, 'error');
        }
      });
    }

    loadQuestionLibrary();
  }

  static initJoinPage() {
    const codeFromURL = getQueryParam('code');
    if (codeFromURL) {
      const input = document.getElementById('join-code-input');
      if (input) input.value = codeFromURL.toUpperCase();
    }

    let selectedAvatar = '😎';
    document.querySelectorAll('#avatar-picker .avatar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('#avatar-picker .avatar-item').forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
        selectedAvatar = e.currentTarget.getAttribute('data-avatar');
      });
    });

    const joinBtn = document.getElementById('submit-join-btn');
    if (joinBtn) {
      joinBtn.addEventListener('click', async () => {
        const roomCode = document.getElementById('join-code-input')?.value.trim();
        const playerName = document.getElementById('join-name-input')?.value.trim();

        if (!roomCode || !playerName) {
          showToast('Please enter both Room Code and your Name.', 'error');
          return;
        }

        try {
          const res = await API.joinRoom({
            room_code: roomCode,
            player_name: playerName,
            player_avatar: selectedAvatar
          });

          localStorage.setItem(`bf_user_${res.room_id}`, res.friend_id);
          localStorage.setItem(`bf_role_${res.room_id}`, 'friend');

          showToast('Joined Room successfully!', 'success');
          setTimeout(() => {
            window.location.href = `waiting.html?room=${res.room_id}`;
          }, 1200);
        } catch (e) {
          showToast(e.message, 'error');
        }
      });
    }
  }

  static initWaitingPage() {
    const roomId = getQueryParam('room');
    const userId = localStorage.getItem(`bf_user_${roomId}`);
    if (!roomId) {
      window.location.href = 'index.html';
      return;
    }

    let isReady = false;

    // Ready toggle button listener
    const readyBtn = document.getElementById('toggle-ready-btn');
    if (readyBtn) {
      readyBtn.addEventListener('click', async () => {
        sounds.playClick();
        isReady = !isReady;
        readyBtn.textContent = isReady ? 'I am Ready! ✅' : 'Click when Ready 👍';
        readyBtn.className = isReady ? 'btn btn-primary' : 'btn btn-secondary';

        try {
          await API.toggleReady(roomId, userId, isReady);
        } catch (e) {
          showToast(e.message, 'error');
        }
      });
    }

    // Live Room Polling
    async function pollRoomState() {
      try {
        const room = await API.getRoomDetails(roomId);

        // Update UI
        const titleEl = document.getElementById('room-title-display');
        if (titleEl) titleEl.textContent = room.title;

        const codeEl = document.getElementById('room-code-display');
        if (codeEl) codeEl.textContent = room.code;

        // Player 1 (Creator) Card
        const p1Name = document.getElementById('p1-name');
        const p1Avatar = document.getElementById('p1-avatar');
        const p1Status = document.getElementById('p1-status');
        if (p1Name) p1Name.textContent = room.creator_name || 'Creator';
        if (p1Avatar) p1Avatar.textContent = room.creator_avatar || '😊';
        if (p1Status) {
          p1Status.textContent = room.creator_ready ? 'Ready ✅' : 'Waiting... ⏳';
          p1Status.style.color = room.creator_ready ? '#10b981' : '#f59e0b';
        }

        // Player 2 (Friend) Card
        const p2Name = document.getElementById('p2-name');
        const p2Avatar = document.getElementById('p2-avatar');
        const p2Status = document.getElementById('p2-status');
        if (p2Name) p2Name.textContent = room.friend_name || 'Waiting for Friend...';
        if (p2Avatar) p2Avatar.textContent = room.friend_avatar || '❓';
        if (p2Status) {
          p2Status.textContent = room.friend_id ? (room.friend_ready ? 'Ready ✅' : 'Connected 🤝') : 'Sharing Link...';
          p2Status.style.color = room.friend_ready ? '#10b981' : '#64748b';
        }

        // Generate QR Code & Invite Link
        const joinURL = `${window.location.origin}/join.html?code=${room.code}`;
        const qrContainer = document.getElementById('qr-code-box');
        if (qrContainer && !qrContainer.dataset.rendered) {
          qrContainer.innerHTML = generateSVGQRCode(joinURL);
          qrContainer.dataset.rendered = "true";
        }

        // Automatically start quiz when IN_PROGRESS
        if (room.status === 'IN_PROGRESS') {
          showToast('Both players are ready! Launching challenge...', 'success');
          sounds.playSuccessFanfare();
          setTimeout(() => {
            window.location.href = `quiz.html?room=${room.id}`;
          }, 1500);
        }
      } catch (e) {}
    }

    setInterval(pollRoomState, 2000);
    pollRoomState();

    // Copy Link & Code Buttons
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const code = document.getElementById('room-code-display')?.textContent;
        const joinURL = `${window.location.origin}/join.html?code=${code}`;
        navigator.clipboard.writeText(joinURL);
        showToast('Invite link copied to clipboard! 📋', 'success');
      });
    }

    const copyCodeBtn = document.getElementById('copy-code-btn');
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', () => {
        const code = document.getElementById('room-code-display')?.textContent;
        navigator.clipboard.writeText(code);
        showToast('Room code copied! 📋', 'success');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.id === 'create-page') RoomManager.initCreatePage();
  if (document.body.id === 'join-page') RoomManager.initJoinPage();
  if (document.body.id === 'waiting-page') RoomManager.initWaitingPage();
});
