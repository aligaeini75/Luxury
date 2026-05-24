ALTER TABLE woman_availability ADD COLUMN location_title TEXT DEFAULT '';
ALTER TABLE woman_availability ADD COLUMN location_hint TEXT DEFAULT '';
ALTER TABLE woman_availability ADD COLUMN location_photos_json TEXT DEFAULT '[]';
ALTER TABLE woman_availability ADD COLUMN services_json TEXT DEFAULT '[]';
ALTER TABLE woman_availability ADD COLUMN total_price REAL DEFAULT 0;
ALTER TABLE woman_availability ADD COLUMN status TEXT DEFAULT 'active';
