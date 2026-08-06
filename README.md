# Best Friend Challenge • Modern Web Application

A full-stack, production-ready **Best Friend Challenge** web application built with **FastAPI (Python)**, **SQLAlchemy**, and **Vanilla Modern HTML5/CSS3/ES6 JavaScript**.

Features a glassmorphic UI, dark mode toggle, Web Audio API sound synthesis, 30-second circular countdown timer, QR code generation, canvas certificate export, and a secure **Delayed Answer Reveal** engine.

---

## 🌟 Key Features

* **Multi-Format Quiz Engine**: Supports Multiple Choice (MCQ), True/False, Text Answers (case-insensitive), Emoji Choice, and 1–10 Rating Sliders.
* **50+ Pre-populated Questions**: Categorized in Food, Lifestyle, Entertainment, Personal, and Fun & Quirky + custom question builder.
* **Room & Invite Link System**: 6-character room codes, shareable invitation links (`/join.html?code=XXXXXX`), and SVG QR codes.
* **Delayed Answer Reveal**: Neither player can see answers until **both** Player 1 (Creator) and Player 2 (Friend) have finished all questions.
* **Answer Lock Protection**: Submitted answers are permanently locked to prevent editing or refresh exploits.
* **Web Audio Sound Effects**: Zero-dependency Web Audio synth for clicks, countdown ticks, and victory fanfares.
* **Canvas Certificate Export**: Download an official PNG compatibility certificate featuring player names, avatars, match percentage, and achievement rank (*"Soulmates ✨"*, *"Great Friends 🔥"*, *"Almost Twins 👯"*, *"Good Friends 👍"*, *"Need More Time Together ⏳"*).
* **Public Leaderboard**: Highlights top compatibility match scores across all challenge rooms.

---

## 📁 Project Structure

```
best_friend_challenge/
├── frontend/
│   ├── index.html          # Landing Page & Hero Section
│   ├── create.html         # Challenge Creation Wizard & Question Picker
│   ├── join.html           # Join Room Screen
│   ├── waiting.html        # Lobby & Live Status Polling
│   ├── quiz.html           # Quiz Arena & Circular Timer
│   ├── result.html         # Compatibility Match & Breakdown
│   ├── leaderboard.html    # Public High Score Board
│   ├── css/
│   │   ├── style.css       # Design System Tokens & Glassmorphism
│   │   ├── animations.css  # Keyframe Animations & Confetti
│   │   ├── responsive.css  # Mobile & Tablet Breakpoints
│   │   └── darkmode.css    # Deep Slate Dark Theme
│   └── js/
│       ├── api.js          # REST API Client Module
│       ├── app.js          # Theme & Audio Controller
│       ├── timer.js        # SVG 30s Circular Countdown Timer
│       ├── quiz.js         # Quiz Arena & Answer Lock Engine
│       ├── room.js         # Room Creator & Polling Engine
│       ├── results.js      # Results Counter & Certificate Generator
│       └── utils.js        # Web Audio Synth & SVG QR Generator
├── backend/
│   ├── main.py             # FastAPI App, CORS, Static Mounting & Question Seeder
│   ├── database.py         # SQLAlchemy Engine (SQLite / PostgreSQL)
│   ├── config.py           # Environment Variables & Settings
│   ├── models.py           # Database Schemas (User, Room, Question, Answer, Result, Leaderboard)
│   ├── schemas.py          # Pydantic Validation Schemas
│   ├── auth.py             # User Sessions
│   ├── utils.py            # Room Code & Match % Algorithms
│   ├── routers/            # Modular Endpoint Handlers
│   │   ├── rooms.py
│   │   ├── quiz.py
│   │   ├── users.py
│   │   └── results.py
│   ├── services/           # Business Logic Engines
│   │   ├── room_service.py
│   │   ├── result_service.py
│   │   └── timer_service.py
│   └── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
* Python 3.10+ installed

### 2. Run the Application
Open PowerShell / Terminal in the project root:

```powershell
# Navigate into the backend directory
cd best_friend_challenge\backend

# Install dependencies (first time only)
python -m pip install -r requirements.txt

# Start the FastAPI server with live reload
python -m uvicorn main:app --reload
```

Open your browser at:
`http://127.0.0.1:8000`

---

## 🐳 Docker Deployment

To build and run using Docker:

```bash
docker-compose up --build -d
```

The app will be available at `http://localhost:8000`.

---

## 📡 REST API Documentation

FastAPI provides automatic interactive Swagger documentation at:
`http://127.0.0.1:8000/api/docs`

### Key Endpoints:
* `POST /api/rooms/create`: Create a new challenge room
* `POST /api/rooms/join`: Join a room using room code
* `GET /api/rooms/{id}`: Fetch live room & player readiness status
* `POST /api/rooms/ready`: Toggle player readiness
* `GET /api/quiz/questions`: Fetch 50+ question bank
* `GET /api/quiz/room/{id}/questions`: Fetch specific room questions
* `POST /api/quiz/submit-answer`: Submit and lock question answer
* `POST /api/quiz/finish`: Mark player quiz completion
* `GET /api/results/{id}`: Fetch detailed breakdown and delayed reveal results
* `GET /api/leaderboard`: Fetch public leaderboard
* `GET /api/health`: Service health check

---

## 🛡️ Switching to PostgreSQL (Production)

Set the `DATABASE_URL` environment variable:
`DATABASE_URL=postgresql://user:password@localhost:5432/bf_challenge_db`

The SQLAlchemy ORM engine will automatically connect to PostgreSQL without changing application code.
