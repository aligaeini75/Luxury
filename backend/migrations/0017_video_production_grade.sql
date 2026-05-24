CREATE TABLE IF NOT EXISTS video_call_quality_logs (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT,
  rtt REAL NOT NULL DEFAULT 0,
  jitter REAL NOT NULL DEFAULT 0,
  packet_loss REAL NOT NULL DEFAULT 0,
  bitrate REAL NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_call_reports (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  reporter_id TEXT,
  kind TEXT NOT NULL,
  reason TEXT,
  quality_json TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  admin_note TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS video_call_moderation (
  booking_id TEXT PRIMARY KEY,
  admin_notice TEXT,
  force_closed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_video_call_quality_booking ON video_call_quality_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_video_call_reports_booking ON video_call_reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_video_call_reports_status ON video_call_reports(status);
