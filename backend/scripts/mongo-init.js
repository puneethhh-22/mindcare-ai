// MongoDB initialization script
db = db.getSiblingDB('mindcare_db');

db.createCollection('users');
db.createCollection('chat_sessions');
db.createCollection('chat_messages');
db.createCollection('mood_entries');
db.createCollection('water_intake');
db.createCollection('sleep_entries');
db.createCollection('activity_entries');
db.createCollection('weight_entries');
db.createCollection('medications');
db.createCollection('medication_logs');

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.chat_messages.createIndex({ session_id: 1, created_at: -1 });
db.chat_sessions.createIndex({ user_id: 1, updated_at: -1 });
db.mood_entries.createIndex({ user_id: 1, entry_date: -1 });
db.medications.createIndex({ user_id: 1, is_active: 1 });
db.medication_logs.createIndex({ user_id: 1, entry_date: -1 });

print('MindCare AI database initialized successfully');
