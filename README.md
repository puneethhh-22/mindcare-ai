# MindCare AI – Intelligent Healthcare & Wellness Assistant

![MindCare AI](https://img.shields.io/badge/MindCare-AI-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge)

> ⚠️ **Medical Disclaimer**: MindCare AI is NOT a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

---

## Overview

MindCare AI is an advanced AI-powered healthcare and wellness platform combining:
- 🧠 Mental health support with CBT-inspired strategies
- 🩺 Symptom checker with urgency recommendations
- 💊 Medication reminders and adherence tracking
- 📊 Comprehensive wellness tracking dashboard
- 🔒 Privacy-first, HIPAA/GDPR-inspired architecture

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│              React 18 + TypeScript + Tailwind CSS            │
│         (Chat UI, Dashboard, Tracker, Auth Pages)            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                       API GATEWAY                            │
│                  FastAPI (Python 3.11)                        │
│         JWT Auth │ Rate Limiting │ CORS │ Logging            │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │          │
┌──────▼──┐ ┌────▼────┐ ┌───▼───┐ ┌───▼───┐ ┌────▼────┐
│  Auth   │ │  Chat   │ │Symptom│ │ Meds  │ │Wellness │
│Service  │ │Service  │ │Service│ │Service│ │Service  │
└──────┬──┘ └────┬────┘ └───┬───┘ └───┬───┘ └────┬────┘
       │         │           │         │           │
┌──────▼─────────▼───────────▼─────────▼───────────▼──────────┐
│                        AI/ML LAYER                           │
│   LangChain │ OpenAI/Gemini │ HuggingFace │ Sentiment Model  │
└─────────────────────────────┬────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                      DATA LAYER                              │
│          MongoDB (Atlas) │ Redis (Cache/Sessions)            │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
mindcare-ai/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   ├── core/              # Config, security, middleware
│   │   ├── models/            # Pydantic & DB models
│   │   ├── services/          # Business logic
│   │   ├── ai/                # AI/ML modules
│   │   └── utils/             # Helpers
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state management
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (or Gemini API key)

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/mindcare-ai.git
cd mindcare-ai
cp .env.example .env
# Edit .env with your API keys and database credentials
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

### 3. Run Locally (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Environment Variables

See `.env.example` for all required variables including:
- `OPENAI_API_KEY` or `GEMINI_API_KEY`
- `MONGODB_URL`
- `JWT_SECRET_KEY`
- `REDIS_URL`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/chat/message` | Send chat message |
| GET | `/api/v1/chat/history` | Get chat history |
| POST | `/api/v1/symptoms/analyze` | Analyze symptoms |
| GET | `/api/v1/medications` | List medications |
| POST | `/api/v1/medications` | Add medication |
| POST | `/api/v1/wellness/mood` | Log mood entry |
| GET | `/api/v1/wellness/summary` | Weekly summary |
| POST | `/api/v1/wellness/water` | Log water intake |
| POST | `/api/v1/wellness/sleep` | Log sleep data |

---

## Deployment

### Docker (Recommended)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Render.com
1. Connect GitHub repo
2. Set environment variables
3. Deploy backend as Web Service (Python)
4. Deploy frontend as Static Site

### Vercel (Frontend)
```bash
cd frontend && vercel --prod
```

---

## Security & Privacy

- JWT-based authentication with refresh tokens
- Passwords hashed with bcrypt
- All health data encrypted at rest
- Rate limiting on all endpoints
- CORS configured for production domains
- No PII logged in application logs
- Data retention policies configurable

---

## Future Enhancements

1. Voice input/output (Web Speech API + TTS)
2. Wearable integration (Apple Health, Google Fit)
3. Appointment booking with calendar sync
4. PDF medical report summarization
5. Doctor/admin dashboard
6. Emergency contact SMS alerts (Twilio)
7. Multilingual support (i18n)
8. Mobile app (React Native)
9. Federated learning for privacy-preserving ML
10. HL7 FHIR compliance for EHR integration

---

## License

MIT License — See LICENSE file for details.

## Contributing

Pull requests welcome. Please read CONTRIBUTING.md first.
