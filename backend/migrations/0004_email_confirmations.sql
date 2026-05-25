ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;

CREATE TABLE IF NOT EXISTS email_confirmations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code_digest TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_confirmations_user ON email_confirmations(user_id, consumed_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_email ON email_confirmations(email, consumed_at, expires_at);
