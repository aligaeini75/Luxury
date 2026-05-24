CREATE TABLE IF NOT EXISTS video_call_rooms (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'cloudflare-realtime',
  status TEXT NOT NULL DEFAULT 'scheduled',
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_call_participants (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT,
  cf_session_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_call_tracks (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT,
  cf_session_id TEXT,
  track_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_call_events (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'cloudflare-realtime',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_video_call_rooms_booking ON video_call_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_video_call_tracks_booking ON video_call_tracks(booking_id);
CREATE INDEX IF NOT EXISTS idx_video_call_events_booking ON video_call_events(booking_id);
