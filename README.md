# 🌟 Pratibha AI
### *Empowering India's Anganwadi Heroes*

**Team Name:** Hacker Heist  
**Team Members:** Mohd Shadab & Aviral Trivedi  
**Submission:** Phase 2 Submission — *"Less Paperwork. More Child Engagement."*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Express Backend](https://img.shields.io/badge/Express-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite DB](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-AI-F97316?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Testing Engine](https://img.shields.io/badge/Vitest-4.1.9-7E9B2D?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 🔗 Project Links & Assets
* **Live Demo App:** [https://pratibha-ai-prototype.vercel.app](https://pratibha-ai-prototype.vercel.app)
* **Presentation Slide Deck:** [Pratibha AI PPT.pptx](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/doc/Pratibha%20AI%20PPT.pptx)
* **Technical Analysis PDF:** [Pratibha_AI_Analysis_Report.pdf](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/doc/Pratibha_AI_Analysis_Report.pdf)

---

## 💡 The Problem & Real-World Impact

| 🚫 The Pain Point | ✨ The Pratibha AI Solution |
| :--- | :--- |
| **Heavy Paperwork Burden:** Anganwadi Workers (AWWs) spend **30%–40% of their day** manually filling registers (attendance, growth charts, vaccine logs). | **Zero Typing & Voice-First:** AWWs dictate observations in local Indian languages (Hindi, Marathi, etc.). The system automatically parses voice into database tables. |
| **Poor Rural Connectivity:** Remote rural locations suffer from erratic internet, causing cloud-only apps to fail completely. | **Robust Offline-First Engine:** Features complete local sync, custom Service Worker caching, offline fallback pages, and Last-Write-Wins (LWW) sync conflict resolution. |
| **Data Inaction:** Raw health data sits in paper records without providing actionable advice to fight child malnutrition. | **Gemini AI RAG Assistant:** An AI assistant that analyzes active database entries to suggest localized, nutritional guidelines tailored to each child. |

---

## 🛠️ Key Technical Features

### 🎙️ 1. Multilingual Voice-to-Text & NLP Parser
* **Local Language Dictation:** Allows voice inputs in Hindi, Bengali, Marathi, and English.
* **Intelligent Entity Mapping:** Queries the active SQLite database to match child names dynamically rather than relying on hardcoded labels.
* **Checklist Automation:** Automatically parses structural items like child attendance, weight changes, and vaccine checkmarks.

### 📶 2. Offline-First Architecture & Service Workers
* **PWA Smart Caching:** Custom Service Worker (`sw.js`) caches static UI shells using a **Cache-First** strategy, and stores database endpoints using a **Network-First** fallback.
* **Bilingual Offline Screen:** Displays a helpful bilingual (Hindi/English) offline screen ([offline.html](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/frontend/public/offline.html)) when connection drops.
* **Sync Conflict Engine:** Runs a Last-Write-Wins (LWW) conflict resolution logic using client-side base sync timestamps, throwing clear warnings if multi-device edits collide.

### 🤖 3. Enterprise Gemini AI RAG Proxy
* **Streaming SSE (Server-Sent Events):** Implements smooth, word-by-word streaming responses for AI chat interactions.
* **Secure Key Storage:** Hides API keys strictly behind the Express backend proxy environment variables.
* **RAG Context Guardrails:** Packs active child profiles into a token budget of `2500` tokens, prioritizing the most recent observations.
* **Bilingual Welcome Engine:** Greets the worker dynamically in their selected language by accessing active session profile data.

### 🔒 4. Production Security Practices
* **Token Protection:** Restricts all backend routes using verified Bearer JWT tokens.
* **Input Validator (Zod):** Strict schema validations using Zod middleware to block malicious or malformed inputs.
* **Express Security Headers:** Integrated `Helmet` for secure response headers and `Express-Rate-Limit` to mitigate API abuse (max 100 requests per 15 minutes, login limited to 5 attempts).

---

## 📐 System Architecture

```mermaid
graph TD
  AW((Anganwadi Worker)) -->|Voice/Text Input| UI[Vite React PWA Shell]
  
  subgraph "Client Environment (Offline Capable)"
    UI --> AppState[React Context State Manager]
    AppState -->|Offline Cache Store| LS["Local Storage"]
    UI -->|Asset Cache| SW[Service Worker sw.js]
    SW --> Cache["Browser Cache API"]
  end

  UI -->|Secure Bearer JWT Request| API[Express API Gateway]

  subgraph "Secure Backend Environment"
    API -->|Auth Verification| Middleware[JWT & Rate Limit Middleware]
    API -->|Prisma Client| DB["SQLite Database (dev.db)"]
    API -->|Secure RAG API Proxy| ChatRoute[/api/ai/chat]
  end

  ChatRoute -->|Protected API Key| Gemini[Google Gemini 2.5 Flash API]
```

---

## 📁 Repository Directory Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # DB Models (Child, Worker, Observation, Attendance, etc.)
│   │   └── seed.js         # SQLite Database seed configuration
│   ├── middleware/
│   │   └── auth.js         # JWT Token validators & rate-limiter rules
│   ├── tests/
│   │   └── api.test.js     # API integration tests using Supertest
│   ├── index.js            # Express API Server and Gemini RAG proxy routing
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── sw.js           # Custom PWA Service Worker
│   │   └── offline.html    # Bilingual offline fallback screen
│   ├── src/
│   │   ├── components/     # UI components (Toasts, Navigation tabs, Drawers)
│   │   ├── context/        # App state, Offline queues, and Language contexts
│   │   ├── hooks/          # useSpeech, useAuth, useOffline, useChildren hooks
│   │   ├── screens/        # LoginScreen, AiAssistantScreen, VoiceReportScreen, etc.
│   │   ├── setupTests.ts   # Vitest testing configurations
│   │   └── types.ts        # Shared TypeScript interfaces
│   ├── vite.config.ts      # Vite project bundler settings
│   └── package.json
├── package.json            # Main workspace setup for concurrent commands
├── vercel.json             # Root-level Vercel build & route configurations
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v20 or newer
* **NPM**: v10 or newer

### 1. Install Dependencies
Run the command at the root directory of the project to configure both frontend and backend directories concurrently:
```bash
npm run install:all
```

### 2. Add Environment Configurations
Create a `.env` file inside the `backend/` directory:
```bash
# Location: backend/.env
JWT_SECRET=b4fcc4b86eb5c0e391874d96a4fd5bb692d1ad188f992c7f575c02571a5a12d1
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Initialize SQLite DB & Seed
Run migrations and populate seed data inside the SQLite database:
```bash
cd backend
npx prisma db push
npx prisma db seed
cd ..
```

---

## 🏃 Running the Application

### Start Concurrently (Recommended)
Run the root command to fire up both the backend Express server and Vite frontend compiler:
```bash
npm run dev
```
* **Frontend Client:** Available at [http://localhost:3000](http://localhost:3000) (Running inside a premium mobile emulator shell)
* **Backend Express Server:** Available at [http://localhost:5000](http://localhost:5000)

---

## 🧪 Comprehensive Testing Suite

The repository has been built using a test-driven approach with high coverage. All tests run locally using **Vitest**, **React Testing Library**, and **Supertest**.

### Run All Tests (Frontend & Backend)
```bash
npm run test
```

### Individual Directory Tests
* **Frontend Tests only:** `npm run test:frontend` (covers UI actions, welcome translations, token estimations, and components).
* **Backend Tests only:** `npm run test:backend` (covers OTP requests, JWT authentication barriers, rate-limit verifications, and SQLite CRUD).

---
*Developed with ❤️ to empower community healthcare and grassroots workers across India.*
