BEGIN;

CREATE TABLE users(
    user_id  SERIAL,
    email    VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL
);
ALTER TABLE users ADD CONSTRAINT pk_user PRIMARY KEY (user_id);


CREATE TABLE restaurants(
    restaurant_id SERIAL,
    address       VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    url           VARCHAR(255) NOT NULL,
    latitude      DECIMAL(9, 6) NOT NULL,
    longitude     DECIMAL(9, 6) NOT NULL,
    menu_url      VARCHAR(255) NOT NULL
);


ALTER TABLE restaurants ADD CONSTRAINT pk_restaurants PRIMARY KEY (restaurant_id);


CREATE TABLE menus(
    menu_id        SERIAL,
    restaurant_id  INT,
    valid_for_date DATE NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE
);
ALTER TABLE menus ADD CONSTRAINT pk_menus PRIMARY KEY (menu_id);
ALTER TABLE menus ADD CONSTRAINT fk_menus_restaurants FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

CREATE TABLE meals(
    meal_id SERIAL,
    name    VARCHAR(255) NOT NULL,
    price   INT          NOT NULL,
    menu_id INT
);
ALTER TABLE meals ADD CONSTRAINT pk_meals PRIMARY KEY (meal_id);
ALTER TABLE meals ADD CONSTRAINT fk_meals_menus FOREIGN KEY (menu_id) REFERENCES menus(menu_id) ON DELETE CASCADE;


CREATE TABLE favourites(
    user_id       INT,
    restaurant_id int
);
ALTER TABLE favourites ADD CONSTRAINT pk_favourites PRIMARY KEY (user_id, restaurant_id);
ALTER TABLE favourites ADD CONSTRAINT fk_favourites_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE favourites ADD CONSTRAINT fk_favourites_restaurants FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;


CREATE TABLE reviews(
    user_id INT,
    restaurant_id INT,
    stars INT NOT NULL,
    review TEXT
);
ALTER TABLE reviews ADD CONSTRAINT pk_reviews PRIMARY KEY (user_id, restaurant_id);
ALTER TABLE reviews ADD CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT fk_restaurants FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE;

COMMIT;
