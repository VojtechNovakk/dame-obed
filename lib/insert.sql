BEGIN;

INSERT INTO users (email, username, password) VALUES
('user@example.com', 'user', 'password');

INSERT INTO restaurants (restaurant_id, address, name, latitude, longitude) VALUES
(1, 'Karlovo náměstí 1, Praha', 'Salieri Ristorante', 50.081812, 14.417345),
(2, 'Dejvická 42, Praha', 'The Cyberpunk Burger', 50.080521, 14.419211),
(3, 'Via Roma 15, Cecina', 'Tuscan Grill & Steaks', 50.081134, 14.415890);

INSERT INTO menus (menu_id, restaurant_id, valid_for_date, created_at) VALUES
(1, 1, '2026-07-22', NOW()),
(2, 2, '2026-07-22', NOW()),
(3, 3, '2026-07-23', NOW());

INSERT INTO meals (menu_id, name, price) VALUES
(1, 'Spaghetti Carbonara', 250),
(1, 'Omerta Veal Chop', 450),
(2, 'Double Smash Burger with Bacon', 280),
(2, 'Night City Fries', 120),
(3, 'Butter-Basted Medium Rare Ribeye', 650),
(3, 'Pork Tenderloin with Herb Crust', 320);

COMMIT;
