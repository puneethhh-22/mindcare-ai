# MindCare AI – API Reference

Base URL: `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/docs`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```
**Response 201:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "...",
  "username": "johndoe",
  "email": "user@example.com"
}
```

---

### POST `/auth/login`
**Body:** `{ "email": "...", "password": "..." }`  
**Response 200:** Same as register.

---

### POST `/auth/logout`
🔒 Protected. Blacklists the current token.

---

### GET `/auth/me`
🔒 Protected. Returns full user profile.

---

### PUT `/auth/me`
🔒 Protected. Update profile fields.

---

## Chat

### POST `/chat/message`
🔒 Protected. Send a message to the AI.

**Body:**
```json
{
  "message": "I'm feeling anxious today",
  "session_id": "optional-existing-session-id",
  "session_type": "mental_health"
}
```
**Response 200:**
```json
{
  "session_id": "...",
  "message_id": "...",
  "response": "I hear you...",
  "crisis_detected": false,
  "sentiment_score": -0.32,
  "sentiment_label": "negative",
  "message_type": "text",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET `/chat/sessions`
🔒 Protected. List all chat sessions.

---

### GET `/chat/sessions/{session_id}/history`
🔒 Protected. Get message history for a session.

---

### DELETE `/chat/sessions/{session_id}`
🔒 Protected. Soft-delete a session.

---

## Symptom Checker

### POST `/symptoms/analyze`
🔒 Protected.

**Body:**
```json
{
  "symptoms": "headache, fever, sore throat for 2 days",
  "duration": "2 days",
  "additional_context": "no known allergies",
  "use_profile_data": true
}
```
**Response 200:**
```json
{
  "possible_conditions": ["Common cold", "Influenza", "Strep throat"],
  "urgency_level": "doctor_consultation",
  "urgency_explanation": "Symptoms have persisted for 2 days...",
  "self_care_tips": ["Rest and stay hydrated", "Use throat lozenges"],
  "red_flags": ["High fever above 103°F", "Difficulty swallowing"],
  "when_to_call_911": "If you develop difficulty breathing",
  "disclaimer": "⚠️ NOT medical advice...",
  "emergency_alert": false
}
```

---

### POST `/symptoms/faq`
🔒 Protected.

**Body:** `{ "question": "What is the difference between a cold and flu?" }`

---

## Medications

### GET `/medications`
🔒 Protected. List active medications.

### POST `/medications`
🔒 Protected. Add a medication.

**Body:**
```json
{
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "times": ["08:00", "20:00"],
  "instructions": "Take with food",
  "color": "#059669",
  "reminder_enabled": true
}
```

### PUT `/medications/{id}`
🔒 Protected. Update a medication.

### DELETE `/medications/{id}`
🔒 Protected. Deactivate (soft-delete) a medication.

### POST `/medications/log`
🔒 Protected. Log a dose as taken or skipped.

**Body:** `{ "medication_id": "...", "status": "taken" }`

### GET `/medications/adherence`
🔒 Protected. Get adherence statistics.

---

## Wellness

### POST `/wellness/mood`
🔒 Protected. Log a mood check-in.

**Body:**
```json
{
  "mood_score": 7,
  "mood_label": "good",
  "emotions": ["Calm", "Grateful"],
  "journal_text": "Had a productive day...",
  "triggers": [],
  "activities": ["walking"]
}
```

### GET `/wellness/mood?days=7`
🔒 Protected. Get mood history.

### GET `/wellness/mood/trend`
🔒 Protected. Get AI mood trend prediction.

### POST `/wellness/water`
🔒 Protected. Log water intake.  
**Body:** `{ "amount_ml": 250 }`

### GET `/wellness/water/today`
🔒 Protected. Get today's water summary.

### POST `/wellness/sleep`
🔒 Protected.
```json
{
  "sleep_start": "2024-01-15T22:30:00Z",
  "sleep_end": "2024-01-16T06:30:00Z",
  "quality_score": 4
}
```

### POST `/wellness/activity`
🔒 Protected.
```json
{
  "activity_type": "walking",
  "steps": 8000,
  "duration_minutes": 45
}
```

### POST `/wellness/weight`
🔒 Protected. `{ "weight_kg": 72.5 }`

### GET `/wellness/summary`
🔒 Protected. AI-powered weekly summary.

### GET `/wellness/tip`
🔒 Protected. Personalized daily wellness tip.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden |
| 404 | Resource not found |
| 422 | Unprocessable entity (schema error) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

```json
{ "detail": "Error message here" }
```
