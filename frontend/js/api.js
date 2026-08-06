// REST API Client Module
const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = 'An unexpected API error occurred.';
    try {
      const data = await response.json();
      errorMsg = data.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return await response.json();
}

export const API = {
  // Room Endpoints
  async createRoom(payload) {
    const res = await fetch(`${API_BASE}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async joinRoom(payload) {
    const res = await fetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getRoomDetails(roomId) {
    const res = await fetch(`${API_BASE}/rooms/${roomId}`);
    return handleResponse(res);
  },

  async toggleReady(roomId, userId, readyState) {
    const res = await fetch(`${API_BASE}/rooms/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId, ready: readyState })
    });
    return handleResponse(res);
  },

  // Quiz Endpoints
  async getQuestionLibrary() {
    const res = await fetch(`${API_BASE}/quiz/questions`);
    return handleResponse(res);
  },

  async getRoomQuestions(roomId) {
    const res = await fetch(`${API_BASE}/quiz/room/${roomId}/questions`);
    return handleResponse(res);
  },

  async submitAnswer(payload) {
    const res = await fetch(`${API_BASE}/quiz/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async finishQuiz(roomId, userId) {
    const res = await fetch(`${API_BASE}/quiz/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, user_id: userId })
    });
    return handleResponse(res);
  },

  // Results & Leaderboard Endpoints
  async getResults(roomId) {
    const res = await fetch(`${API_BASE}/results/${roomId}`);
    return handleResponse(res);
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return handleResponse(res);
  }
};
