-- Safe ticket/admin indexes migration.
-- If your DB does not have ticket_locked/admin_note, run once manually:
-- ALTER TABLE users ADD COLUMN ticket_locked INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN admin_note TEXT DEFAULT '';
-- CREATE INDEX IF NOT EXISTS idx_users_ticket_locked ON users(ticket_locked);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
