# 👯 Best Friend Challenge — Full-Stack Web Application

A modern, responsive, multiplayer quiz web application designed for friends to test their compatibility and see how well they really know each other. Built with **FastAPI** on the backend and **Vanilla HTML5/CSS3/JavaScript (ES6+)** on the frontend for maximum performance and zero build-step overhead.

---

## 🌟 Key Features

* **Instant Multiplayer Rooms**: Host generates a unique 6-character room code; friends join seamlessly via link or code.
* **Synchronized Game Flow**: Live polling keeps room state, player ready status, and answer submissions synchronized.
* **Answer Locking & Reveal**: Answers remain completely hidden until both players finish the challenge.
* **Compatibility Engine**: Calculates match percentages, compatibility scores, and assigns fun custom titles (e.g. *Soulmates ✨*, *Almost Twins 👯*).
* **Rich Question Types**:
  * Multiple Choice Questions (MCQ)
  * True / False
  * Free Text
  * Rating Scale (1-10)
  * Emoji Picker
* **50+ Seeded Questions + Custom Questions**: Host can choose from preset categories or craft custom questions.
* **Fully Responsive UI**: Modern glassmorphic aesthetic with mobile-optimized touch controls and smooth micro-animations.

---

## 🏗️ Senior Developer Folder Architecture

```text
best_friend_challenge/
├── backend/                  # FastAPI Application Core
│   ├── app/                  # Main Application Package
│   │   ├── core/             # Infrastructure, Database & App Configuration
│   │   │   ├── config.py     # Environment & App Settings
│   │   │   ├── database.py   # SQLAlchemy Engine & Session Factory
│   │   │   └── auth.py       # Session Token Utilities
│   │   ├── models/           # SQLAlchemy ORM Data Models
│   │   │   └── models.py     # User, Room, Question, Answer, Result, Leaderboard
│   │   ├── schemas/          # Pydantic Schemas & DTOs
│   │   │   └── schemas.py    # Request/Response Validation Models
│   │   ├── services/         # Core Domain Business Logic
│   │   │   ├── room_service.py   # Room Creation & Player Pairing
│   │   │   ├── result_service.py # Compatibility & Answer Comparison Engine
│   │   │   └── timer_service.py  # Timer Helper Utilities
│   │   ├── utils/            # Shared Utilities
│   │   │   └── helpers.py    # Code Generation & Match Score Algorithms
│   │   ├── routers/          # REST API Route Controllers
│   │   │   ├── quiz.py       # Questions & Answer Submissions
│   │   │   ├── results.py    # Compatibility Results & Leaderboard
│   │   │   ├── rooms.py      # Room Management & Status
│   │   │   └── users.py      # User Session Endpoints
│   │   └── main.py           # FastAPI Initialization & Static Asset Mounting
│   ├── run.py                # Server Execution Entrypoint
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Static Web Assets (Vanilla HTML/CSS/JS)
│   ├── css/                  # Styling & Responsive Breakpoint Matrix
│   │   ├── style.css         # Modern Theme & Utilities
│   │   └── responsive.css    # Mobile & Tablet Adjustments
│   ├── js/                   # Vanilla JavaScript Modules
│   │   ├── api.js            # Unified Fetch REST API Client
│   │   ├── app.js            # Core App Logic & Global Helpers
│   │   ├── create.js         # Challenge Room Creation
│   │   ├── join.js           # Room Joining Flow
│   │   ├── quiz.js           # Live Quiz Engine & Input Handling
│   │   ├── results.js        # Score Breakdown & Celebration UI
│   │   └── waiting.js        # Real-time Lobby Polling
│   └── *.html                # Modular Views (index, create, join, waiting, quiz, results)
├── scripts/                  # Automated Startup Scripts
│   ├── start.bat             # Windows Quick Launcher
│   └── start.sh              # macOS/Linux Quick Launcher
├── .gitignore                # Comprehensive Python / Database Git Ignore
├── README.md                 # Technical Documentation
└── start.bat                 # Root Convenience Launcher
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **ORM / Database** | [SQLAlchemy](https://www.sqlalchemy.org/) + SQLite (Dev) / PostgreSQL (Prod ready) |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) |
| **Frontend UI** | HTML5, CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism), ES6+ Vanilla JS |
| **API Architecture** | RESTful JSON API |

---

## 🚀 Quick Start (Local Development)

### Windows (One-Click Launch)
Simply double-click `start.bat` in the root folder, or execute in PowerShell:
```powershell
.\start.bat
```

### Manual Command Line Startup (All Platforms)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**:
   ```bash
   python run.py
   ```
   *Alternatively:*
   ```bash
   python -m uvicorn main:app --reload
   ```

4. **Access the application**:
   * 🌐 **Web Interface**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   * 📜 **Interactive API Docs (Swagger)**: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rooms/create` | Create a new challenge room with preset/custom questions |
| `POST` | `/api/rooms/join` | Join an existing room via 6-character room code |
| `GET` | `/api/rooms/{room_id}` | Fetch current room status and player states |
| `POST` | `/api/rooms/ready` | Toggle player ready state in the lobby |
| `GET` | `/api/quiz/room/{room_id}/questions` | Get active questions for the room |
| `POST` | `/api/quiz/submit-answer` | Lock and store a player's answer |
| `POST` | `/api/quiz/finish` | Signal that player has completed all questions |
| `GET` | `/api/results/{room_id}` | Calculate match score and generate side-by-side comparison |
| `GET` | `/api/leaderboard` | View top friend matches |
| `GET` | `/api/health` | Backend and database health status |

---

## ⚖️ License
Distributed under the **MIT License**. Free for personal and commercial use.
