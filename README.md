# Pratibha AI (प्रतिभा एआई) — Comprehensive Anganwadi Management System

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js Express](https://img.shields.io/badge/Express-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-AI-F97316?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.9-7E9B2D?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

**Pratibha AI** is an intelligent, offline-first Anganwadi Assistant designed to empower Anganwadi Workers (AWWs) under India's Integrated Child Development Services (ICDS) scheme. By automating child nutrition tracking, attendance logging, home visit planning, and generating administrative reports, it reduces paperwork burdens. It features real-time multilingual voice transcription, secure server-side LLM proxies, and robust offline synchronization with conflict resolution.

---

## 📖 Table of Contents
1. [🌟 Real-World Impact & Vision](#-real-world-impact--vision)
2. [💡 Core Features](#-core-features)
3. [🏗️ Architectural Architecture](#%EF%B8%8F-architectural-architecture)
4. [🛠️ Technical Stack](#%EF%B8%8F-technical-stack)
5. [📁 Directory Structure](#-directory-structure)
6. [⚙️ Installation & Setup](#%EF%B8%8F-installation--setup)
7. [🏃 Running the Application](#-running-the-application)
8. [🧪 Testing & Verification](#-testing--verification)
9. [🔒 Security Practices](#-security-practices)

---

## 🌟 Real-World Impact & Vision
Anganwadi workers are the backbone of community healthcare and early childhood education in rural India. However, they spend **up to 30-40% of their daily time maintaining physical registers** (attendance, growth charts, vaccine logs). 

**Pratibha AI** eliminates this friction:
* **Zero Typing Required**: Workers dictate observations orally in their local languages.
* **Paperwork Automation**: Converts oral notes into structured, database-ready checklists.
* **Intelligent Insights**: Uses RAG (Retrieval-Augmented Generation) to read child growth data and provide localized recommendations.
* **Designed for Low Connectivity**: Caches everything locally and syncs automatically when workers travel to areas with network connectivity.

---

## 💡 Core Features

### 🎙️ 1. Multilingual Voice-to-Text & NLP Parser
* **Local Language Transcription**: Speak in Hindi, Bengali, Marathi, or English.
* **Dynamic Child Name Recognition**: Refactored parser queries the active database child list to map transcripts, avoiding hardcoded constraints.
* **Structured Information Extraction**: Automatically extracts attendance numbers, growth updates, developmental milestones, and flags nutritional alerts.

### 🤖 2. Secure Gemini AI RAG Assistant (Server-Side Proxy)
* **Streaming SSE Chat**: Simulates responses word-by-word via Server-Sent Events (SSE) for smooth user interactions.
* **Protected API Key**: The Gemini API key is housed strictly in the backend `.env` variables, preventing frontend browser leaks.
* **RAG Context Truncation**: Packs child profiles and historical records into a token budget of `2500` tokens. Automatically prioritizes the most recent observations and displays a warning banner if older logs are truncated.
* **Dynamic Welcomes**: Greets the logged-in worker by name based on session profile data (e.g. *"नमस्ते Saraswati Devi!"*).

### 📶 3. Robust Offline Sync & PWA Caching
* **Interactive Service Worker Cache**: Uses a custom service worker (`sw.js`) to cache static resources (JS, CSS, avatars, fonts) under a **Cache-First** strategy, and API requests under a **Network-First** strategy.
* **Bilingual Offline Fallback**: Features a beautiful bilingual (Hindi/English) helper page ([offline.html](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/frontend/public/offline.html)) when network requests fail.
* **Conflict Resolution (LWW)**: Uses a `lastModified` timestamp on SQLite tables and tracks client baseline sync times. Performs a last-write-wins sync, logging console warnings and UI alert notifications if data was edited on the server since the client's last sync.

### 📊 4. Interactive Dashboards & Growth Metrics
* **Visual Calendars**: Color-coded scheduler showing pending home visits (orange) and completed ones (green).
* **Data-driven Charts**: Uses Recharts to plot child development trends, center attendance, and paperwork reduction logs.

---

## 🏗️ Architectural Architecture

```mermaid
graph TD
  User((Anganwadi Worker)) -->|Voice/Text| Frontend[Vite React PWA]
  
  subgraph Client Browser
    Frontend --> AppState[React Context / AppState]
    AppState -->|Offline Fallback| LocalStorage[(LocalStorage)]
    Frontend -->|Static Assets| ServiceWorker[Service Worker sw.js]
    ServiceWorker --> Cache[(Browser Cache API)]
  end

  Frontend -->|Secure JWT Requests| BackendProxy[Express Backend]

  subgraph Server Backend
    BackendProxy -->|Token Verification| AuthMiddleware[Auth Middleware]
    BackendProxy -->|Prisma client| SQLite[(SQLite Database dev.db)]
    BackendProxy -->|Secure Forwarding| ChatProxy[/api/ai/chat]
  end

  ChatProxy -->|Protected API Key| GoogleGemini[Google Gemini API]
```

---

## 🛠️ Technical Stack

* **Frontend Client**: React 19 (TypeScript), Vite 7, Lucide Icons, Recharts (Charts/KPIs)
* **CSS System**: Tailwind CSS (Utility styling), custom glassmorphism design variables, responsive mobile shell wrapper (`390px x 812px` viewport)
* **Server Services**: Node.js, Express, JSONWebToken, Helmet (Header Security), Express-Rate-Limit
* **ORM & Database**: Prisma ORM, SQLite DB
* **Testing Engine**: Vitest (runner), React Testing Library, Supertest (API request simulator)

---

## 📁 Directory Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Database models (Child, Worker, Observation, Attendance, Activity)
│   │   └── seed.js         # SQLite database seed data
│   ├── middleware/
│   │   └── auth.js         # JWT validation & route protectors
│   ├── tests/
│   │   └── api.test.js     # Supertest suite for API endpoints (Auth lifecycle, CRUD)
│   ├── index.js            # Express server (Authentication, Sync, CRUD, Gemini Proxy)
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── sw.js           # PWA Service Worker (Cache API)
│   │   └── offline.html    # Bilingual offline fallback screen
│   ├── src/
│   │   ├── components/     # Toast banners, sidebar drawers, navigation tabs
│   │   ├── context/        # AppContext (Offline queues, synchronization) & LanguageContext
│   │   ├── hooks/          # useSpeech, useAuth, useOffline, useChildren hooks
│   │   ├── lib/            # apiClient (error payloads), constants (keys)
│   │   ├── screens/        # LoginScreen, AiAssistantScreen, VoiceReportScreen, etc.
│   │   ├── setupTests.ts   # Vitest setup (JSDOM environment, scrollTo mocks)
│   │   └── types.ts        # TypeScript shared interfaces
│   ├── vite.config.ts      # Vite & Vitest setup
│   └── package.json
├── package.json            # Central workspace executor (concurrent execution scripts)
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v20 or newer
* **NPM**: v10 or newer

### 1. Install Workspace Dependencies
Run the install command in the root folder of the project to setup both the frontend and backend project nodes:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# c:/Users/91875/Downloads/Pratibha AI App Prototype/backend/.env
JWT_SECRET=b4fcc4b86eb5c0e391874d96a4fd5bb692d1ad188f992c7f575c02571a5a12d1
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialize the SQLite Database
Run migrations and seed the Prisma SQLite database:
```bash
cd backend
npx prisma db push
npx prisma db seed
cd ..
```

---

## 🏃 Running the Application

### Start Both Frontend and Backend Concurrently (Recommended)
From the root folder, run:
```bash
npm run dev
```
* **Frontend Application**: Access at [http://localhost:3000](http://localhost:3000) (running inside a mobile preview emulator)
* **Backend Server**: Serving API routes at [http://localhost:5000](http://localhost:5000)

### Or Run Individually
* **Backend Server Only**: `npm run dev:backend` (from root) or `npm start` (inside `backend/`)
* **Frontend Dev Server Only**: `npm run dev:frontend` (from root) or `npm run dev` (inside `frontend/`)

---

## 🧪 Testing & Verification

We have implemented robust unit, component, and API endpoint integration test suites using **Vitest**, **React Testing Library**, and **Supertest**.

### Run all tests (Frontend + Backend)
From the root folder:
```bash
npm run test
```

### Run Frontend Tests only
```bash
npm run test:frontend
```
This suite covers:
* **Components**: `LoginScreen` inputs/submissions, `Toast` timers.
* **AI Screens**: `AiAssistantScreen` welcome message greeting interpolation, and RAG context truncation warnings.
* **Utilities**: Token count estimators (`estimateTokens`), date parser (`parseRelativeDate`).

### Run Backend Tests only
```bash
npm run test:backend
```
This suite covers:
* **Authentication**: OTP dispatch validation, JWT verification checks, rate-limit bypassing.
* **Child CRUD**: Attendance updates, observation postings, authenticated query security barriers.

---

## 🔒 Security Practices

1. **API Key Security**: The Gemini API key is never exposed to client browsers. Requests are securely routed through the backend proxy route (`/api/ai/chat`).
2. **JWT Route Protection**: All critical child information routes require a validated Bearer JWT token in the request header.
3. **Validation Middlewares**: Request parameters (like OTP verifications, observations, and sync items) are strictly typed and validated using **Zod** middleware schemas to prevent injection and malformed inputs.
4. **Rate Limiters**: General API requests are throttled using rate limits (`max: 100` per 15 minutes), and login endpoints are guarded with tighter security (`max: 5` attempts per 15 minutes).
