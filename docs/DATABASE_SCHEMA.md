# MindCare AI – Database Schema

MongoDB collections with field definitions and indexes.

---

## Collection: `users`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `email` | String (unique) | User email address |
| `username` | String (unique) | Display username |
| `hashed_password` | String | bcrypt hash |
| `full_name` | String? | Optional display name |
| `is_active` | Boolean | Account active flag |
| `is_verified` | Boolean | Email verified flag |
| `health_profile` | Object | Nested health data (see below) |
| `notification_prefs` | Object | Notification settings |
| `timezone` | String | IANA timezone string |
| `language` | String | ISO 639-1 language code |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last update timestamp |
| `last_login` | DateTime? | Last login timestamp |

**health_profile fields:** `age`, `gender`, `height_cm`, `weight_kg`, `blood_type`, `allergies[]`, `chronic_conditions[]`, `emergency_contact_name`, `emergency_contact_phone`

**Indexes:** `email` (unique), `username` (unique)

---

## Collection: `chat_sessions`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `user_id` | String | Reference to users._id |
| `title` | String | Auto-generated from first message |
| `session_type` | String | `general` \| `mental_health` \| `symptom_check` |
| `message_count` | Integer | Total messages in session |
| `is_active` | Boolean | Soft-delete flag |
| `summary` | String? | AI-generated session summary |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

**Indexes:** `user_id`, `updated_at` (desc)

---

## Collection: `chat_messages`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `session_id` | String | Reference to chat_sessions._id |
| `user_id` | String | Reference to users._id |
| `role` | String | `user` \| `assistant` \| `system` |
| `content` | String | Message text |
| `message_type` | String | `text` \| `crisis_alert` \| `symptom_result` |
| `sentiment_score` | Float? | VADER compound score (-1.0 to 1.0) |
| `sentiment_label` | String? | `positive` \| `neutral` \| `negative` |
| `crisis_detected` | Boolean | Crisis keyword flag |
| `metadata` | Object | Arbitrary extra data |
| `created_at` | DateTime | |

**Indexes:** `session_id`, `user_id`, `created_at` (desc)

---

## Collection: `mood_entries`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `user_id` | String | Reference to users._id |
| `mood_score` | Integer | 1–10 scale |
| `mood_label` | String | `great` \| `good` \| `okay` \| `low` \| `terrible` |
| `emotions` | String[] | Selected emotion tags |
| `journal_text` | String? | Free-text journal entry |
| `triggers` | String[] | Identified triggers |
| `activities` | String[] | Activities logged |
| `ai_response` | String? | AI-generated response |
| `entry_date` | Date | Date of entry (YYYY-MM-DD) |
| `created_at` | DateTime | |

**Indexes:** `user_id`, `entry_date` (desc)

---

## Collection: `water_intake`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `amount_ml` | Float | Amount in millilitres |
| `entry_date` | Date | |
| `logged_at` | DateTime | |

**Indexes:** `user_id`, `entry_date`

---

## Collection: `sleep_entries`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `sleep_start` | DateTime | Bedtime |
| `sleep_end` | DateTime | Wake time |
| `duration_hours` | Float | Calculated duration |
| `quality_score` | Integer | 1–5 scale |
| `notes` | String? | |
| `entry_date` | Date | |
| `created_at` | DateTime | |

---

## Collection: `activity_entries`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `activity_type` | String | walking, running, yoga, etc. |
| `steps` | Integer? | Step count |
| `duration_minutes` | Integer? | |
| `calories_burned` | Float? | |
| `distance_km` | Float? | |
| `entry_date` | Date | |
| `logged_at` | DateTime | |

---

## Collection: `weight_entries`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `weight_kg` | Float | |
| `bmi` | Float? | Auto-calculated if height known |
| `body_fat_percent` | Float? | |
| `notes` | String? | |
| `entry_date` | Date | |
| `logged_at` | DateTime | |

---

## Collection: `medications`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `name` | String | Medication name |
| `dosage` | String | e.g., "500mg" |
| `frequency` | String | daily, twice_daily, weekly, as_needed |
| `times` | String[] | ["08:00", "20:00"] |
| `start_date` | Date | |
| `end_date` | Date? | |
| `instructions` | String? | e.g., "Take with food" |
| `color` | String | Hex color for UI |
| `is_active` | Boolean | Soft-delete flag |
| `reminder_enabled` | Boolean | |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

**Indexes:** `user_id`, `is_active`

---

## Collection: `medication_logs`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `user_id` | String | |
| `medication_id` | String | Reference to medications._id |
| `medication_name` | String | Denormalized for fast reads |
| `scheduled_time` | DateTime | When dose was due |
| `taken_at` | DateTime? | When actually taken |
| `status` | String | `pending` \| `taken` \| `skipped` \| `missed` |
| `notes` | String? | |
| `entry_date` | Date | |
| `created_at` | DateTime | |

**Indexes:** `user_id`, `medication_id`, `entry_date`, `status`
