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

INSERT OR IGNORE INTO woman_profiles(
  id,user_id,display_name,bio,city,public_price,monthly_gallery_price,minimum_offer,cover_url,verified,is_active,created_at,updated_at
)
VALUES(
  'wp_demo_calendar',
  'demo_calendar_woman',
  'پروفایل تست تقویم',
  'این پروفایل برای تست تایم‌های آزاد، تقویم و مسیر رزرو ساخته شده است.',
  'تهران',
  1200000,
  850000,
  500000,
  '/upload-image-placeholder.svg',
  1,
  1,
  datetime('now'),
  datetime('now')
);

DELETE FROM woman_availability WHERE woman_id='demo_calendar_woman';

INSERT INTO woman_availability(
  id,woman_id,booking_type,date,start_time,end_time,duration_minutes,price_override,is_booked,
  location_title,location_hint,location_photos_json,services_json,total_price,status,created_at,updated_at
)
VALUES
('av_demo_calendar_date_1','demo_calendar_woman','date',date('now','+1 day'),'18:00','19:30',90,1200000,0,'لانژ خصوصی شمال شهر','آدرس کامل فقط بعد از تایید درخواست نمایش داده می‌شود.','["/upload-image-placeholder.svg"]','[{"title":"رزرو میز ویژه","price":250000},{"title":"ترانسفر اختصاصی","price":450000}]',1900000,'active',datetime('now'),datetime('now')),
('av_demo_calendar_date_2','demo_calendar_woman','date',date('now','+3 day'),'21:00','22:00',60,950000,0,'کافه هتل','توضیح تستی برای لوکیشن حضوری.','["/upload-image-placeholder.svg"]','[{"title":"پذیرایی ویژه","price":180000}]',1130000,'active',datetime('now'),datetime('now')),
('av_demo_calendar_chat_1','demo_calendar_woman','chat',date('now','+2 day'),'20:00','20:45',45,350000,0,'','','[]','[]',350000,'active',datetime('now'),datetime('now')),
('av_demo_calendar_video_1','demo_calendar_woman','video_call',date('now','+4 day'),'22:00','22:30',30,650000,0,'','','[]','[]',650000,'active',datetime('now'),datetime('now'));

CREATE INDEX IF NOT EXISTS idx_woman_availability_lookup ON woman_availability(woman_id,date,start_time,is_booked,status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_availability ON booking_requests(availability_id);
