INSERT OR IGNORE INTO users(id,email,password_hash,full_name,role,status,verified,created_at,updated_at)
VALUES
('usr_admin','admin@luxora.local','pbkdf2:100000:00112233445566778899aabbccddeeff:ba618256204676edb9225874af0b4b332dcb81eba71a43b5339aef6005558446','Luxora Admin','admin','active',1,datetime('now'),datetime('now')),
('usr_demo_man','man@luxora.local','pbkdf2:100000:00112233445566778899aabbccddeeff:ba618256204676edb9225874af0b4b332dcb81eba71a43b5339aef6005558446','Alexander Noir','man','active',1,datetime('now'),datetime('now')),
('usr_demo_woman','woman@luxora.local','pbkdf2:100000:00112233445566778899aabbccddeeff:ba618256204676edb9225874af0b4b332dcb81eba71a43b5339aef6005558446','Serena Lux','woman','active',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO wallets(id,user_id,balance,locked_balance,created_at,updated_at)
VALUES
('wal_admin','usr_admin',0,0,datetime('now'),datetime('now')),
('wal_man','usr_demo_man',1800,0,datetime('now'),datetime('now')),
('wal_woman','usr_demo_woman',2450,0,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO man_profiles(id,user_id,display_name,bio,main_photo_url,voice_intro_url,video_intro_url,date_note,verified,created_at,updated_at)
VALUES('mp_demo','usr_demo_man','Alexander Noir','Private, refined and curated around quiet luxury.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop','','','A private conversation with clear timing and respectful coordination.',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO man_gallery(id,user_id,url,type,is_main,created_at,updated_at)
VALUES('mg_1','usr_demo_man','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=900&auto=format&fit=crop','photo',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_profiles(id,user_id,display_name,bio,city,public_price,monthly_gallery_price,minimum_offer,cover_url,verified,is_active,created_at,updated_at)
VALUES('wp_demo','usr_demo_woman','Serena Lux','Private luxury profile with curated date, chat and video-call availability.','Dubai',1200,249,80,'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',1,1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_availability(id,woman_id,booking_type,date,start_time,end_time,duration_minutes,price_override,is_booked,created_at,updated_at)
VALUES
('av_date_1','usr_demo_woman','date','2026-05-21','20:00','23:00',180,1250,0,datetime('now'),datetime('now')),
('av_chat_1','usr_demo_woman','chat','2026-05-22','19:00','19:30',30,60,0,datetime('now'),datetime('now')),
('av_video_1','usr_demo_woman','video_call','2026-05-22','21:00','21:45',45,120,0,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_locations(id,woman_id,title,address_hint,date,time,cover_url,price_modifier,is_active,created_at,updated_at)
VALUES('loc_1','usr_demo_woman','Private Rooftop Lounge','Downtown private area','2026-05-21','21:00','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop',300,1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_services(id,woman_id,title,description,price,cover_url,is_active,created_at,updated_at)
VALUES('svc_1','usr_demo_woman','Fine Dining Reservation','Curated restaurant reservation request.',180,'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_galleries(id,woman_id,title,price,cover_url,status,created_at,updated_at)
VALUES('gal_1','usr_demo_woman','Monthly Private Gallery',249,'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop','active',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO woman_gallery_media(id,gallery_id,woman_id,url,type,status,created_at,updated_at)
VALUES
('gm_1','gal_1','usr_demo_woman','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop','photo','active',datetime('now'),datetime('now')),
('gm_2','gal_1','usr_demo_woman','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop','photo','active',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO booking_requests(id,woman_id,man_id,availability_id,booking_type,man_name,man_photo_url,man_note,date,time,duration_minutes,offer_amount,message,status,escrow_status,quality_score,created_at,updated_at)
VALUES('br_1','usr_demo_woman','usr_demo_man','av_chat_1','chat','Alexander Noir','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop','A respectful private chat request.','2026-05-22','19:00',30,60,'I would like to reserve this chat slot.','pending','none',92,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO crypto_deposits(id,user_id,amount,network,deposit_address,provider,status,created_at,updated_at)
VALUES('dep_1','usr_demo_man',500,'USDT_TRC20','TRON_DEMO_USDT_ADDRESS_SET_ENV','manual','pending',datetime('now'),datetime('now'));
INSERT OR IGNORE INTO withdrawals(id,user_id,amount,payout_address,status,created_at,updated_at)
VALUES('wd_1','usr_demo_woman',300,'TRON_PAYOUT_DEMO_ADDRESS','pending',datetime('now'),datetime('now'));
INSERT OR IGNORE INTO wallet_transactions(id,user_id,type,amount,status,note,created_at)
VALUES('tx_1','usr_demo_man','initial_balance',1800,'completed','Seeded demo balance',datetime('now'));
INSERT OR IGNORE INTO kyc_requests(id,user_id,document_type,selfie_url,status,created_at,updated_at)
VALUES('kyc_1','usr_demo_man','passport','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop','pending',datetime('now'),datetime('now'));
INSERT OR IGNORE INTO media_items(id,user_id,url,type,status,created_at,updated_at)
VALUES('med_1','usr_demo_woman','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop','cover','pending',datetime('now'),datetime('now'));
INSERT OR IGNORE INTO tickets(id,user_id,subject,status,created_at,updated_at)
VALUES('tic_1','usr_demo_man','Escrow release question','open',datetime('now'),datetime('now'));
INSERT OR IGNORE INTO ticket_messages(id,ticket_id,sender_id,message,created_at)
VALUES('tm_1','tic_1','usr_demo_man','Can you check my escrow release timeline?',datetime('now'));
INSERT OR IGNORE INTO risk_flags(id,user_id,title,description,severity,status,created_at)
VALUES('risk_1','usr_demo_man','KYC metadata review','Selfie and document metadata require manual review.','medium','open',datetime('now'));
INSERT OR IGNORE INTO activity_feed(id,title,body,created_at)
VALUES('act_1','New booking request','A chat booking is waiting for creator approval.',datetime('now'));
INSERT OR IGNORE INTO revenue_daily(day,amount) VALUES('Mon',620),('Tue',840),('Wed',430),('Thu',1250),('Fri',1740),('Sat',980),('Sun',1420);
INSERT OR IGNORE INTO audit_logs(id,actor_id,action,entity_type,entity_id,metadata,created_at)
VALUES('aud_1','usr_admin','seed_created','system','luxora_core','{}',datetime('now'));
INSERT OR IGNORE INTO provider_settings(key,value,is_secret,updated_at)
VALUES('NOWPAYMENTS_API_KEY','set-via-wrangler-secret',1,datetime('now')),('R2_SIGNING_SECRET','set-via-wrangler-secret',1,datetime('now'));
INSERT OR IGNORE INTO app_errors(id,user_id,path,message,stack,created_at)
VALUES('err_1','usr_admin','/api/demo','Demo monitoring event','',datetime('now'));
