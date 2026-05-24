-- Operational upgrade.
-- access_unlocked_at already exists from 0015_early_open_disputes.sql, so do NOT add it again.

ALTER TABLE kyc_requests ADD COLUMN challenge_text TEXT DEFAULT '';
ALTER TABLE booking_requests ADD COLUMN chat_unlocked INTEGER DEFAULT 0;
ALTER TABLE booking_requests ADD COLUMN video_unlocked INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS operational_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  target_url TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_operational_events_user ON operational_events(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_events_type ON operational_events(event_type);
