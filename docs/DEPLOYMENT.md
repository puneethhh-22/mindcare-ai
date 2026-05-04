# MindCare AI – Deployment Guide

---

## Option 1: Docker Compose (Recommended for self-hosting)

### Development
```bash
cp .env.example .env
# Fill in OPENAI_API_KEY, JWT_SECRET_KEY, etc.
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production
```bash
# Set all required env vars in .env
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## Option 2: Render.com

### Backend (Web Service)
1. Connect your GitHub repo
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment:** Python 3.11
5. Add all env vars from `.env.example`
6. Add a MongoDB Atlas connection string as `MONGODB_URL`
7. Add a Redis (Upstash) URL as `REDIS_URL`

### Frontend (Static Site / Web Service)
1. **Build Command:** `npm install && npm run build`
2. **Publish Directory:** `.next` (or use Node.js web service)
3. Set `NEXT_PUBLIC_API_URL` to your backend Render URL

---

## Option 3: Vercel (Frontend) + Railway (Backend)

### Frontend → Vercel
```bash
cd frontend
npm install -g vercel
vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel dashboard
```

### Backend → Railway
1. Create new Railway project
2. Connect GitHub repo, select `backend/` as root
3. Railway auto-detects Python; set start command:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add MongoDB and Redis plugins from Railway marketplace
5. Set all environment variables

---

## Option 4: AWS (ECS + Fargate)

### Prerequisites
- AWS CLI configured
- ECR repositories created

```bash
# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t mindcare-backend ./backend
docker tag mindcare-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/mindcare-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/mindcare-backend:latest

docker build -t mindcare-frontend ./frontend
docker tag mindcare-frontend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/mindcare-frontend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/mindcare-frontend:latest
```

Then deploy using ECS task definitions with:
- MongoDB Atlas (external) or DocumentDB
- ElastiCache for Redis
- Application Load Balancer
- Secrets Manager for environment variables

---

## Environment Variables Checklist

Before deploying, ensure these are set:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` or `GEMINI_API_KEY` | ✅ | At least one AI provider |
| `JWT_SECRET_KEY` | ✅ | Min 32 chars, random |
| `MONGODB_URL` | ✅ | Atlas connection string |
| `REDIS_URL` | ✅ | Upstash or ElastiCache |
| `ENCRYPTION_KEY` | ✅ | Exactly 32 chars |
| `ALLOWED_ORIGINS` | ✅ | Your frontend domain |
| `SMTP_USER` / `SMTP_PASSWORD` | Optional | For email reminders |

---

## SSL / TLS

For production, always use HTTPS:
- **Render/Railway/Vercel:** SSL is automatic
- **Self-hosted:** Use Let's Encrypt via Certbot:
  ```bash
  certbot certonly --standalone -d your-domain.com
  # Certificates go to /etc/letsencrypt/live/your-domain.com/
  # Copy to nginx/ssl/ directory
  ```

---

## Health Checks

- Backend: `GET /health` → `{"status": "healthy"}`
- Frontend: `GET /` → 200 OK

---

## Monitoring (Recommended)

- **Logs:** Loguru (backend) + Vercel/Render built-in logs
- **Errors:** Sentry (`pip install sentry-sdk`)
- **Uptime:** UptimeRobot (free tier)
- **Metrics:** Prometheus + Grafana (advanced)
