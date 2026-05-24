ALTER TABLE booking_requests ADD COLUMN early_open_approved INTEGER DEFAULT 0;
ALTER TABLE booking_requests ADD COLUMN access_unlocked_at TEXT;

CREATE TABLE IF NOT EXISTS booking_early_open_requests (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  requester_id TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE TABLE IF NOT EXISTS booking_disputes (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  reporter_id TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  admin_note TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_booking_early_open_booking ON booking_early_open_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_disputes_booking ON booking_disputes(booking_id);
