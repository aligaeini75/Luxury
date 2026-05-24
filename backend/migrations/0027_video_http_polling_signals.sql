CREATE TABLE IF NOT EXISTS video_signals (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  signal_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_video_signals_room_time ON video_signals(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_video_signals_sender ON video_signals(booking_id, sender_id, created_at);
