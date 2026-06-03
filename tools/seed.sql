-- ============================================================
-- PROJET ETNAIR — SEED DATA
-- Format: PostgreSQL
-- Mot de passe de tous les utilisateurs : "password"
-- Hash bcrypt cost 10
-- ============================================================

-- ============================================================
-- USERS (10 users: 4 hosts, 5 guests, 1 admin)
-- ============================================================
INSERT INTO users (first_name, last_name, email, password_hash, phone_number, bio, role, is_verified, updated_at) VALUES
('Admin',    'ETNAir',   'admin@etnair.com',        '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000001', 'Platform administrator.',                                    'admin', TRUE,  NOW()),
('James',    'Carter',   'james.carter@email.com',  '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000002', 'Passionate traveler and host. I love sharing my spaces.',    'host',  TRUE,  NOW()),
('Sophia',   'Martin',   'sophia.martin@email.com', '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000003', 'Superhost with 3 properties in Paris and Lyon.',             'host',  TRUE,  NOW()),
('Lucas',    'Brown',    'lucas.brown@email.com',   '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000004', 'I rent out my apartment when traveling.',                    'host',  TRUE,  NOW()),
('Emma',     'Wilson',   'emma.wilson@email.com',   '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000005', 'Host based in Nice, offering cozy seaside apartments.',      'host',  TRUE,  NOW()),
('Oliver',   'Davis',    'oliver.davis@email.com',  '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000006', 'Frequent traveler, love discovering new cities.',            'guest', TRUE,  NOW()),
('Mia',      'Johnson',  'mia.johnson@email.com',   '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000007', 'Explorer and food lover.',                                   'guest', TRUE,  NOW()),
('Noah',     'Taylor',   'noah.taylor@email.com',   '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000008', 'Digital nomad, always on the move.',                        'guest', TRUE,  NOW()),
('Ava',      'Anderson', 'ava.anderson@email.com',  '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000009', 'Love weekend getaways with family.',                        'guest', FALSE, NOW()),
('Ethan',    'Thomas',   'ethan.thomas@email.com',  '$2b$10$Ndn.6FZTYFdgThkaGRcFW.y0X4JS2rVGYZrEzyNdf2DchMaxZjXiG', '+33600000010', 'Student traveler on a budget.',                             'guest', FALSE, NOW());


-- ============================================================
-- PROPERTIES (8 properties owned by hosts)
-- ============================================================
INSERT INTO properties (owner_id, title, description, price_per_night, property_type, max_guests, bedrooms, bathrooms, country, city, address, latitude, longitude, status, updated_at) VALUES
(2, 'Charming Studio in Montmartre',         'A cozy studio in the heart of Montmartre with stunning views.',          85.00,  'studio',    2, 1, 1, 'France',  'Paris',     '12 Rue Lepic, 75018 Paris',              48.886490,  2.337320,  'active',   NOW()),
(2, 'Modern Apartment near Eiffel Tower',    'Bright and spacious apartment just 10 min walk from the Eiffel Tower.',  150.00, 'apartment', 4, 2, 1, 'France',  'Paris',     '5 Avenue de Suffren, 75007 Paris',       48.850220,  2.301890,  'active',   NOW()),
(3, 'Luxury Villa with Pool in Lyon',        'A stunning villa with private pool, perfect for families.',              320.00, 'villa',     8, 4, 3, 'France',  'Lyon',      '14 Chemin des Roses, 69003 Lyon',        45.748780,  4.847120,  'active',   NOW()),
(3, 'Cozy Apartment in Vieux-Lyon',          'Historic district apartment with exposed stone walls and wooden beams.',  95.00,  'apartment', 3, 1, 1, 'France',  'Lyon',      '8 Rue Saint-Jean, 69005 Lyon',           45.760110,  4.827440,  'active',   NOW()),
(4, 'Minimalist Loft in Bordeaux',           'Open-space loft with industrial design, close to the tram.',             110.00, 'apartment', 2, 1, 1, 'France',  'Bordeaux',  '22 Quai des Chartrons, 33000 Bordeaux',  44.851090,  -0.561210, 'active',   NOW()),
(5, 'Seaside Studio in Nice',                'A bright studio steps away from the Promenade des Anglais.',              75.00,  'studio',    2, 1, 1, 'France',  'Nice',      '3 Rue de France, 06000 Nice',            43.695920,  7.265490,  'active',   NOW()),
(5, 'Beautiful House with Garden in Nice',   'Spacious house with a private garden, ideal for families.',              200.00, 'house',     6, 3, 2, 'France',  'Nice',      '17 Boulevard Gambetta, 06000 Nice',      43.710340,  7.261870,  'active',   NOW()),
(4, 'Classic House in Bordeaux Countryside', 'Traditional stone house surrounded by vineyards.',                       175.00, 'house',     5, 3, 2, 'France',  'Bordeaux',  '4 Route des Vignes, 33460 Margaux',      45.039200,  -0.673890, 'inactive', NOW());


-- ============================================================
-- PROPERTY IMAGES
-- ============================================================
INSERT INTO property_images (property_id, image_url, is_main) VALUES
(1, 'https://images.etnair.com/properties/1/main.jpg',   TRUE),
(1, 'https://images.etnair.com/properties/1/room.jpg',   FALSE),
(2, 'https://images.etnair.com/properties/2/main.jpg',   TRUE),
(2, 'https://images.etnair.com/properties/2/living.jpg', FALSE),
(2, 'https://images.etnair.com/properties/2/kitchen.jpg',FALSE),
(3, 'https://images.etnair.com/properties/3/main.jpg',   TRUE),
(3, 'https://images.etnair.com/properties/3/pool.jpg',   FALSE),
(4, 'https://images.etnair.com/properties/4/main.jpg',   TRUE),
(5, 'https://images.etnair.com/properties/5/main.jpg',   TRUE),
(6, 'https://images.etnair.com/properties/6/main.jpg',   TRUE),
(7, 'https://images.etnair.com/properties/7/main.jpg',   TRUE),
(7, 'https://images.etnair.com/properties/7/garden.jpg', FALSE),
(8, 'https://images.etnair.com/properties/8/main.jpg',   TRUE);


-- ============================================================
-- AMENITIES
-- ============================================================
INSERT INTO amenities (name) VALUES
('WiFi'),
('Pool'),
('Parking'),
('Kitchen'),
('Air Conditioning'),
('Heating'),
('Washer'),
('Dryer'),
('TV'),
('Garden');


-- ============================================================
-- PROPERTY AMENITIES
-- ============================================================
INSERT INTO property_amenities (property_id, amenity_id) VALUES
-- Studio Montmartre: WiFi, Kitchen, Heating, TV
(1, 1), (1, 4), (1, 6), (1, 9),
-- Modern Apartment Paris: WiFi, Kitchen, AC, Heating, Washer, TV
(2, 1), (2, 4), (2, 5), (2, 6), (2, 7), (2, 9),
-- Luxury Villa Lyon: WiFi, Pool, Parking, Kitchen, AC, Washer, Dryer, TV, Garden
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 7), (3, 8), (3, 9), (3, 10),
-- Cozy Apartment Vieux-Lyon: WiFi, Kitchen, Heating, TV
(4, 1), (4, 4), (4, 6), (4, 9),
-- Minimalist Loft Bordeaux: WiFi, Kitchen, AC, Washer, TV
(5, 1), (5, 4), (5, 5), (5, 7), (5, 9),
-- Seaside Studio Nice: WiFi, Kitchen, AC, TV
(6, 1), (6, 4), (6, 5), (6, 9),
-- Beautiful House Nice: WiFi, Parking, Kitchen, AC, Washer, Dryer, TV, Garden
(7, 1), (7, 3), (7, 4), (7, 5), (7, 7), (7, 8), (7, 9), (7, 10),
-- Classic House Bordeaux: WiFi, Parking, Kitchen, Heating, Washer, Garden
(8, 1), (8, 3), (8, 4), (8, 6), (8, 7), (8, 10);


-- ============================================================
-- BOOKINGS (10 bookings by guests, various statuses)
-- ============================================================
INSERT INTO bookings (guest_id, property_id, start_date, end_date, total_price, booking_status) VALUES
(6,  1, '2025-01-10', '2025-01-15', 425.00,  'completed'),
(7,  2, '2025-01-20', '2025-01-25', 750.00,  'completed'),
(8,  3, '2025-02-05', '2025-02-10', 1600.00, 'completed'),
(9,  4, '2025-02-14', '2025-02-17', 285.00,  'completed'),
(10, 5, '2025-03-01', '2025-03-04', 330.00,  'completed'),
(6,  6, '2025-03-15', '2025-03-20', 375.00,  'completed'),
(7,  7, '2025-04-01', '2025-04-06', 1000.00, 'confirmed'),
(8,  1, '2025-04-20', '2025-04-23', 255.00,  'confirmed'),
(9,  2, '2025-05-10', '2025-05-15', 750.00,  'pending'),
(10, 6, '2025-05-20', '2025-05-22', 150.00,  'cancelled');


-- ============================================================
-- REVIEWS (for completed bookings only)
-- ============================================================
INSERT INTO reviews (booking_id, reviewer_id, property_id, rating, comment) VALUES
(1, 6, 1, 5, 'Amazing studio! Perfect location in Montmartre, very clean and cozy. Highly recommend.'),
(2, 7, 2, 4, 'Great apartment, very close to the Eiffel Tower. A bit noisy at night but overall excellent.'),
(3, 8, 3, 5, 'The villa is absolutely stunning. The pool was perfect. We will definitely come back!'),
(4, 9, 4, 4, 'Charming apartment in a historic area. The exposed stone walls were beautiful.'),
(5, 10, 5, 3, 'Nice loft but smaller than expected. Good location though.'),
(6, 6, 6, 5, 'Perfect seaside studio. Steps away from the beach, everything we needed.');


-- ============================================================
-- PAYMENTS (one per booking)
-- ============================================================
INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id) VALUES
(1,  425.00,  'completed', 'card',          'txn_001_stripe'),
(2,  750.00,  'completed', 'paypal',        'txn_002_paypal'),
(3,  1600.00, 'completed', 'card',          'txn_003_stripe'),
(4,  285.00,  'completed', 'card',          'txn_004_stripe'),
(5,  330.00,  'completed', 'bank_transfer', 'txn_005_bank'),
(6,  375.00,  'completed', 'card',          'txn_006_stripe'),
(7,  1000.00, 'completed', 'card',          'txn_007_stripe'),
(8,  255.00,  'completed', 'paypal',        'txn_008_paypal'),
(9,  750.00,  'pending',   'card',          'txn_009_stripe'),
(10, 150.00,  'refunded',  'card',          'txn_010_stripe');


-- ============================================================
-- AVAILABILITY (next 2 weeks for active properties)
-- ============================================================
INSERT INTO availability (property_id, available_date, is_available) VALUES
-- Property 1
(1, '2025-05-01', TRUE),  (1, '2025-05-02', TRUE),  (1, '2025-05-03', FALSE),
(1, '2025-05-04', FALSE), (1, '2025-05-05', TRUE),  (1, '2025-05-06', TRUE),
-- Property 2
(2, '2025-05-01', TRUE),  (2, '2025-05-02', TRUE),  (2, '2025-05-03', TRUE),
(2, '2025-05-04', FALSE), (2, '2025-05-05', FALSE),  (2, '2025-05-06', TRUE),
-- Property 3
(3, '2025-05-01', TRUE),  (3, '2025-05-02', TRUE),  (3, '2025-05-03', TRUE),
(3, '2025-05-04', TRUE),  (3, '2025-05-05', FALSE), (3, '2025-05-06', FALSE),
-- Property 6
(6, '2025-05-01', FALSE), (6, '2025-05-02', FALSE), (6, '2025-05-03', TRUE),
(6, '2025-05-04', TRUE),  (6, '2025-05-05', TRUE),  (6, '2025-05-06', TRUE),
-- Property 7
(7, '2025-05-01', TRUE),  (7, '2025-05-02', TRUE),  (7, '2025-05-03', TRUE),
(7, '2025-05-04', FALSE), (7, '2025-05-05', FALSE), (7, '2025-05-06', TRUE);


-- ============================================================
-- WISHLISTS
-- ============================================================
INSERT INTO wishlists (user_id, property_id) VALUES
(6, 3), (6, 7),
(7, 1), (7, 5),
(8, 2), (8, 6),
(9, 3), (9, 7),
(10, 1), (10, 4);


-- ============================================================
-- MESSAGES
-- ============================================================
INSERT INTO messages (sender_id, receiver_id, property_id, content, is_read) VALUES
(6,  2, 1, 'Hi James! Is the studio available for early check-in on January 10th?',          TRUE),
(2,  6, 1, 'Hi Oliver! Yes, early check-in is possible from 11am. See you then!',            TRUE),
(7,  3, 3, 'Hello Sophia, can we bring our dog to the villa?',                               TRUE),
(3,  7, 3, 'Hi Mia! Unfortunately pets are not allowed in the villa. Sorry about that.',     TRUE),
(8,  4, 5, 'Hey Lucas, is parking included with the loft rental?',                           TRUE),
(4,  8, 5, 'Hi Noah! Yes, one parking spot is included. No worries.',                        TRUE),
(9,  5, 7, 'Hi Emma! Is the garden private or shared with other guests?',                    FALSE),
(10, 5, 6, 'Hello, does the studio have air conditioning? It is very important for us.',     FALSE);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, content, is_read) VALUES
(6,  'Booking Confirmed',    'Your booking at Charming Studio in Montmartre has been confirmed.',         TRUE),
(7,  'Booking Confirmed',    'Your booking at Modern Apartment near Eiffel Tower has been confirmed.',   TRUE),
(8,  'Booking Confirmed',    'Your booking at Luxury Villa with Pool in Lyon has been confirmed.',       TRUE),
(2,  'New Booking Received', 'You have a new booking request for Charming Studio in Montmartre.',        TRUE),
(3,  'New Booking Received', 'You have a new booking request for Luxury Villa with Pool in Lyon.',      TRUE),
(9,  'Booking Pending',      'Your booking at Modern Apartment near Eiffel Tower is pending approval.',  FALSE),
(10, 'Booking Cancelled',    'Your booking at Seaside Studio in Nice has been cancelled.',               FALSE),
(6,  'New Message',          'You have a new message from James Carter regarding your upcoming stay.',   TRUE),
(5,  'New Message',          'You have a new unread message from a guest about your property.',          FALSE),
(1,  'New User Registered',  'A new user has registered on the platform: Ethan Thomas.',                TRUE);
