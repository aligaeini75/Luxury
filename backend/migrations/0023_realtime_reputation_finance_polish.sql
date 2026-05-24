CREATE TABLE IF NOT EXISTS user_presence (
  user_id TEXT PRIMARY KEY,
  online INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT NOT NULL,
  current_page TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS booking_reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewee_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS escrow_timeline (
  id TEXT PRIMARY KEY,
  escrow_id TEXT,
  booking_id TEXT,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  push_enabled INTEGER NOT NULL DEFAULT 1,
  email_enabled INTEGER NOT NULL DEFAULT 0,
  booking_enabled INTEGER NOT NULL DEFAULT 1,
  finance_enabled INTEGER NOT NULL DEFAULT 1,
  support_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_reviews_reviewee ON booking_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_booking_reviews_booking ON booking_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_timeline_booking ON escrow_timeline(booking_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_read ON user_alerts(user_id, is_read);
