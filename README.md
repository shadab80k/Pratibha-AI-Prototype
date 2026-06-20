# Pratibha AI - Comprehensive Anganwadi Management System

Pratibha AI is an AI-powered mobile assistant and database prototype designed for Anganwadi workers (ICDS - Integrated Child Development Services) in India. The application reduces administrative overhead by automating child registry tracking, attendance logs, nutrition monitoring, home visit schedules, and government reports using real-time Voice-to-Text transcription and generative AI.

---

## 🚀 Key Features

### 1. Offline-First Architecture & Hybrid Fallback (Phase 5.2)
* **Node.js/Express Backend**: A lightweight REST backend exposing API endpoints for CRUD operations and authentication.
* **Persistent File Database**: Real-time transactions are written to `server/db.json` using a thread-safe JSON file driver.
* **Hybrid Fallback Synchronization**:
  * Tries online sync first. If the Express server is offline or unreachable, the client degrades gracefully to the local browser `localStorage` database.
  * Captures and queues actions (attendance edits, observations, home visits, activities) under the "Offline Queue".
  * Click **Sync Now** to bulk sync queued actions via `/api/sync` once online.
* **Service Worker Caching**: Registered a Service Worker (`sw.js`) that caches styles, scripts, and media resources for offline access. Includes an installable Web App Manifest (`manifest.json`).

### 2. JWT Authentication & PIN Security
* **JWT Access Tokens**: Secured API endpoints using JSON Web Token (JWT) validation middleware. Log in using Worker ID (`AW-4521`) and Mobile (`9876543210`) to retrieve a token valid for 7 days.
* **PIN Lock Security**: Enable a 4-digit security PIN lock in settings to protect local registries. Includes an OTP bypass reset.

### 3. Real AI Assistant & RAG Context Chat (Phase 5.1)
* **Retrieval-Augmented Generation (RAG)**: Automatically reads child profiles (attendance history, observations, milestones) and feeds them as system context to the Gemini LLM.
* **SSE Stream Reader**: Implements browser fetch stream chunk readers to output AI answers word-by-word dynamically.
* **Voice-to-Text Transcription**: Native browser Web Speech API records oral updates in Hindi, Bengali, Marathi, or English.
* **AI Structured Voice Reports**: Generates and formats structured observations, category tags, and nutrition alerts from voice dictation.

### 4. Interactive Calendars & Dynamic Analytics
* **Visual Planner**: Monthly calendar grid highlighting pending (orange) and completed (green) home visits.
* **Dynamic KPIs**: Evaluates paperwork reductions, time-saved counters, and weekly metrics.
* **Recharts Visualizations**: Renders weekly engagement trends and attendance records.

---

## 🛠️ Tech Stack
* **Frontend**: React 19 + TypeScript + Vite 7
* **Styling**: Tailwind CSS + Shadcn UI + Lucide Icons
* **Charts**: Recharts 2.15.4
* **Backend**: Express + CORS + JSONWebToken + Dotenv
* **Database**: Pure JS File Database (`server/db.json`)

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js v20+

### Setup Commands
1. Clone or extract the project repository.
2. In the root directory, install all frontend and backend dependencies:
   ```bash
   npm install
   ```
3. Initialize the server subdirectory:
   ```bash
   cd server
   ```
   Install its package dependencies:
   ```bash
   npm install
   ```
   Return to the root directory:
   ```bash
   cd ..
   ```

---

## 🏃 Running the Application

To run both the Vite React frontend client and the Node Express server concurrently, execute:
```bash
npm run dev
```

* **Frontend**: Accessible at [http://localhost:5173](http://localhost:5173)
* **Backend**: Running on [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing Verification & Fallbacks
1. **JWT Verification**: Log in on the Login Screen with ID `AW-4521` and Mobile `9876543210`. Verify that token is stored in the browser's Local Storage as `pratibha_jwt`.
2. **Database Persistence**: Add an observation or update attendance in the UI. Inspect `server/db.json` to confirm modifications were written successfully.
3. **Connection Graceful Degradation**: Stop the backend server using `Ctrl+C` in the terminal. Perform actions in the application. Confirm they are cached inside the local database and appear as sync cards on the Offline Screen.
