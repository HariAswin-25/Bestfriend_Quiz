// REST API Client Module
const getApiBase = () => {
  if (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') {
    return 'http://127.0.0.1:8000/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorMsg = 'An unexpected API error occurred.';
      try {
        const data = await res.json();
        errorMsg = data.detail || data.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch') || err.message.includes('Network')) {
      throw new Error('Backend server is offline! Please start server by running start.bat');
    }
    throw err;
  }
}

export const API = {
  // Room Endpoints
  async createRoom(payload) {
    return safeFetch(`${API_BASE}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async joinRoom(payload) {
    return safeFetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getRoomDetails(roomId) {
    return safeFetch(`${API_BASE}/rooms/${roomId}`);
  },

  async toggleReady(roomId, userId, readyState) {
    return safeFetch(`${API_BASE}/rooms/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId, ready: readyState })
    });
  },

  // Quiz Endpoints
  async getQuestionLibrary() {
    return safeFetch(`${API_BASE}/quiz/questions`);
  },

  async getRoomQuestions(roomId) {
    return safeFetch(`${API_BASE}/quiz/room/${roomId}/questions`);
  },

  async submitAnswer(payload) {
    return safeFetch(`${API_BASE}/quiz/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async finishQuiz(roomId, userId) {
    return safeFetch(`${API_BASE}/quiz/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId })
    });
  },

  // Results & Leaderboard Endpoints
  async getResults(roomId) {
    return safeFetch(`${API_BASE}/results/${roomId}`);
  },

  async getLeaderboard() {
    return safeFetch(`${API_BASE}/leaderboard`);
  }
};
