-- migrate:up

-- ========================================================
-- 1. AUTENTICACIÓN Y USUARIOS
-- ========================================================
CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  email    VARCHAR(60)  NOT NULL UNIQUE,
  phone    VARCHAR(15),
  password VARCHAR(100) NOT NULL,
  status   VARCHAR(20)  NOT NULL DEFAULT 'activo',
  role_id  INTEGER      NOT NULL REFERENCES roles(id)
);

CREATE TABLE diners (
  id         SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name  VARCHAR(50) NOT NULL,
  user_id    INTEGER     NOT NULL UNIQUE REFERENCES users(id)
);

-- ========================================================
-- 2. LOCALES, HORARIOS Y CARTA
-- ========================================================
CREATE TABLE stores (
  id               SERIAL PRIMARY KEY,
  commercial_name  VARCHAR(60) NOT NULL,
  campus_location  VARCHAR(100),
  logo_url         VARCHAR(150),
  operative_status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  user_id          INTEGER     NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE store_photos (
  id       SERIAL PRIMARY KEY,
  url      VARCHAR(150) NOT NULL,
  store_id INTEGER      NOT NULL REFERENCES stores(id) ON DELETE CASCADE
);

-- day_of_week: 1 = lunes ... 7 = domingo (mismo orden que la pantalla Horario)
CREATE TABLE store_schedules (
  id          SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  open_time   TIME,
  close_time  TIME,
  is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE (store_id, day_of_week)
);

CREATE TABLE categories (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(40) NOT NULL,
  display_order INTEGER     NOT NULL DEFAULT 0,
  store_id      INTEGER     NOT NULL REFERENCES stores(id) ON DELETE CASCADE
);

-- preparation_time en minutos; daily_stock NULL = sin límite diario
CREATE TABLE products (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(60)   NOT NULL,
  description      VARCHAR(160),
  price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  picture_url      VARCHAR(150),
  available        BOOLEAN       NOT NULL DEFAULT TRUE,
  daily_stock      INTEGER       CHECK (daily_stock >= 0),
  preparation_time INTEGER       CHECK (preparation_time >= 0),
  category_id      INTEGER       NOT NULL REFERENCES categories(id),
  store_id         INTEGER       NOT NULL REFERENCES stores(id) ON DELETE CASCADE
);

-- selection_type: 'unica' | 'multiple' (valores de la pantalla Opciones y agregados)
CREATE TABLE option_groups (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(50) NOT NULL,
  selection_type VARCHAR(20) NOT NULL CHECK (selection_type IN ('unica', 'multiple')),
  is_required    BOOLEAN     NOT NULL DEFAULT FALSE,
  product_id     INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_options (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(50)   NOT NULL,
  additional_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (additional_price >= 0),
  option_group_id  INTEGER       NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE
);

-- ========================================================
-- 3. CARRITO DE COMPRAS
-- ========================================================
CREATE TABLE carts (
  id       SERIAL PRIMARY KEY,
  diner_id INTEGER NOT NULL UNIQUE REFERENCES diners(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  notes      VARCHAR(120),
  cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE cart_item_options (
  id                SERIAL PRIMARY KEY,
  cart_item_id      INTEGER NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
  product_option_id INTEGER NOT NULL REFERENCES product_options(id) ON DELETE CASCADE
);

-- ========================================================
-- 4. PEDIDOS
-- ========================================================
CREATE TABLE order_statuses (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE orders (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(10)   NOT NULL UNIQUE,
  pickup_date  DATE          NOT NULL,
  pickup_time  TIME          NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  created      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diner_id     INTEGER       NOT NULL REFERENCES diners(id),
  store_id     INTEGER       NOT NULL REFERENCES stores(id),
  status_id    INTEGER       NOT NULL REFERENCES order_statuses(id)
);

-- product_name y unit_price son copia del momento de la compra;
-- si se borra el producto, el historial del pedido se conserva (product_id queda NULL)
CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  product_name VARCHAR(60)   NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER       NOT NULL CHECK (quantity > 0),
  subtotal     NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  notes        VARCHAR(120),
  order_id     INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER       REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE order_item_options (
  id               SERIAL PRIMARY KEY,
  option_name      VARCHAR(50)   NOT NULL,
  additional_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (additional_price >= 0),
  order_item_id    INTEGER       NOT NULL REFERENCES order_items(id) ON DELETE CASCADE
);

-- ========================================================
-- 5. CALIFICACIONES
-- ========================================================
CREATE TABLE order_reviews (
  id           SERIAL PRIMARY KEY,
  store_rating INTEGER NOT NULL CHECK (store_rating BETWEEN 1 AND 5),
  comment      TEXT,
  order_id     INTEGER NOT NULL UNIQUE REFERENCES orders(id),
  diner_id     INTEGER NOT NULL REFERENCES diners(id),
  store_id     INTEGER NOT NULL REFERENCES stores(id)
);

CREATE TABLE product_reviews (
  id              SERIAL PRIMARY KEY,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  order_review_id INTEGER NOT NULL REFERENCES order_reviews(id) ON DELETE CASCADE,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  UNIQUE (order_review_id, product_id)
);

-- ========================================================
-- DATOS INICIALES (valores tomados de las pantallas y de la sesión actual)
-- ========================================================
INSERT INTO roles (name) VALUES ('enterprises'), ('owner'), ('comensal');

INSERT INTO order_statuses (name) VALUES
  ('recibido'), ('preparacion'), ('listo'), ('entregado'), ('rechazado');

-- migrate:down

DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS order_reviews;
DROP TABLE IF EXISTS order_item_options;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_statuses;
DROP TABLE IF EXISTS cart_item_options;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_options;
DROP TABLE IF EXISTS option_groups;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS store_schedules;
DROP TABLE IF EXISTS store_photos;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS diners;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
