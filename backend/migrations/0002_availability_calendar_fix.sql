ALTER TABLE woman_availability ADD COLUMN location_title TEXT NOT NULL DEFAULT '';
ALTER TABLE woman_availability ADD COLUMN location_hint TEXT NOT NULL DEFAULT '';
ALTER TABLE woman_availability ADD COLUMN location_photos_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE woman_availability ADD COLUMN services_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE woman_availability ADD COLUMN total_price REAL NOT NULL DEFAULT 0;
ALTER TABLE woman_availability ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

UPDATE woman_availability
SET date = substr(date, 1, 10)
WHERE length(date) > 10 AND date GLOB '____-__-__*';

UPDATE woman_availability
SET status = 'archived'
WHERE date IN ('{y}-{m}-{day}', '') OR date LIKE '{%';

UPDATE woman_availability
SET total_price = price_override
WHERE total_price = 0 AND price_override > 0;

CREATE INDEX IF NOT EXISTS idx_woman_availability_lookup ON woman_availability(woman_id,date,start_time,is_booked,status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_availability ON booking_requests(availability_id);
