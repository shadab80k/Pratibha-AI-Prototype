# 🌟 Pratibha AI
### *Empowering India's Anganwadi Heroes*

**Team Name:** Hacker Heist  
**Team Members:** Mohd Shadab & Aviral Trivedi  
**Submission Type:** Phase 2 Submission — *"Less Paperwork. More Child Engagement."*

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 7](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Express Backend](https://img.shields.io/badge/Express-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite DB](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-AI-F97316?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

---

## ⚡ Quick Links
* **Live Demo App:** [https://pratibha-ai-prototype.vercel.app](https://pratibha-ai-prototype.vercel.app)
* **Presentation Slide Deck:** [Pratibha AI PPT.pptx](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/doc/Pratibha%20AI%20PPT.pptx)
* **Technical Analysis PDF:** [Pratibha_AI_Analysis_Report.pdf](file:///c:/Users/91875/Downloads/Pratibha%20AI%20App%20Prototype/doc/Pratibha_AI_Analysis_Report.pdf)

---

## 💡 The Vision & Elevator Pitch
Anganwadi Workers (AWWs) are the backbone of child healthcare in India but spend **up to 40% of their day on manual paperwork**. 

**Pratibha AI** solves this by offering a **voice-first, 100% offline-capable management system** that automates attendance, growth tracking, and generates personalized child health advice via Secure Gemini AI RAG.

---

## 🚀 Key Features

* 🎙️ **Voice-First Dictation:** Workers simply speak in local Indian languages (Hindi, Marathi, etc.). Our custom NLP parser converts voice notes directly into database records—**Zero typing required!**
* 📶 **Robust Offline-First Engine:** Built using a custom Service Worker cache (`sw.js`) and SQLite. The app operates completely offline in remote villages, syncing data seamlessly with Last-Write-Wins (LWW) conflict resolution once network is found.
* 🤖 **Secure Gemini AI RAG Proxy:** Analyzes child profile trends to suggest localized nutritional guidelines. API keys are kept strictly secure on the backend proxy with client responses streamed smoothly via Server-Sent Events (SSE).
* 🔒 **Production-Grade Security:** Fully protected with JWT tokens, Zod schema inputs validator, Helmet security headers, and endpoint rate-limiters.

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

## 🛠️ Technology Stack
* **Frontend Client:** React 19, Vite 7, Tailwind CSS, Lucide Icons, Recharts
* **Backend Server:** Node.js, Express, JSONWebToken, Helmet, Zod Validation, Express-Rate-Limit
* **ORM & Database:** Prisma ORM, SQLite DB

---

## ⚙️ Installation & Setup (3 Steps)

### 1. Install Workspace Dependencies
Run at the root directory of the project:
```bash
npm run install:all
```

### 2. Configure Environment variables
Create a `.env` file inside the `backend/` directory:
```env
JWT_SECRET=b4fcc4b86eb5c0e391874d96a4fd5bb692d1ad188f992c7f575c02571a5a12d1
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Initialize SQLite Database
```bash
cd backend
npx prisma db push
npx prisma db seed
cd ..
```

### 🏃 Start the Application
From the root folder, run:
```bash
npm run dev
```
* **Frontend Portal:** [http://localhost:3000](http://localhost:3000) (renders in a glassmorphic mobile emulator shell)
* **Backend Express Server:** [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing Suite
We maintain a robust test suite covering components, state utils, and API endpoints.

* **Run all tests (Frontend + Backend):** `npm run test`
* **Run Frontend tests only:** `npm run test:frontend`
* **Run Backend tests only:** `npm run test:backend`
