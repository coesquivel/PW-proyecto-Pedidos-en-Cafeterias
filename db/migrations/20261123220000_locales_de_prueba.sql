-- migrate:up

-- Dos locales más para probar con varios locales (contraseña '123', solo desarrollo).
INSERT INTO users (email, phone, password, status, role_id) VALUES
  ('sanguches@admin', NULL, '123', 'activo', (SELECT id FROM roles WHERE name = 'enterprises')),
  ('cafe@admin',      NULL, '123', 'activo', (SELECT id FROM roles WHERE name = 'enterprises'));

INSERT INTO stores (commercial_name, campus_location, operative_status, user_id)
SELECT 'Sanguchería Pabellón E', 'Pabellón E', 'activo', id FROM users WHERE email = 'sanguches@admin';

INSERT INTO stores (commercial_name, campus_location, operative_status, user_id)
SELECT 'Café de Biblioteca', 'Biblioteca', 'activo', id FROM users WHERE email = 'cafe@admin';

-- Cartas de ejemplo
INSERT INTO categories (name, display_order, store_id)
SELECT c.name, c.display_order, s.id
FROM stores s
JOIN users u ON u.id = s.user_id AND u.email = 'sanguches@admin'
CROSS JOIN (VALUES ('Sanguches', 1), ('Bebidas', 2)) AS c(name, display_order);

INSERT INTO categories (name, display_order, store_id)
SELECT c.name, c.display_order, s.id
FROM stores s
JOIN users u ON u.id = s.user_id AND u.email = 'cafe@admin'
CROSS JOIN (VALUES ('Cafés', 1), ('Postres', 2)) AS c(name, display_order);

INSERT INTO products (name, description, price, available, preparation_time, category_id, store_id)
SELECT p.name, p.description, p.price, p.available, p.prep, c.id, c.store_id
FROM (VALUES
  ('Sanguches',  'Sándwich de pollo',   'Pollo deshilachado con palta',  11.50, TRUE,  8),
  ('Sanguches',  'Sándwich de jamón',   'Jamón, queso y lechuga',         9.00, TRUE,  6),
  ('Sanguches',  'Triple clásico',      'Palta, tomate y huevo',          8.50, FALSE, 6),
  ('Bebidas',    'Jugo surtido',        'Vaso de 12 oz',                  9.00, TRUE,  4),
  ('Bebidas',    'Limonada',            'Frozen o natural',               6.00, TRUE,  3)
) AS p(categoria, name, description, price, available, prep)
JOIN categories c ON c.name = p.categoria
JOIN stores s ON s.id = c.store_id
JOIN users u ON u.id = s.user_id AND u.email = 'sanguches@admin';

INSERT INTO products (name, description, price, available, preparation_time, category_id, store_id)
SELECT p.name, p.description, p.price, p.available, p.prep, c.id, c.store_id
FROM (VALUES
  ('Cafés',      'Café pasado',         'Taza de 8 oz',                   4.00, TRUE,  2),
  ('Cafés',      'Capuchino',           'Con espuma de leche',            7.50, TRUE,  4),
  ('Postres',    'Brownie',             'Con nueces',                     5.50, TRUE,  1),
  ('Postres',    'Torta de zanahoria',  'Porción individual',             6.50, TRUE,  1)
) AS p(categoria, name, description, price, available, prep)
JOIN categories c ON c.name = p.categoria
JOIN stores s ON s.id = c.store_id
JOIN users u ON u.id = s.user_id AND u.email = 'cafe@admin';

-- migrate:down

DELETE FROM products   WHERE store_id IN (SELECT s.id FROM stores s JOIN users u ON u.id = s.user_id WHERE u.email IN ('sanguches@admin', 'cafe@admin'));
DELETE FROM categories WHERE store_id IN (SELECT s.id FROM stores s JOIN users u ON u.id = s.user_id WHERE u.email IN ('sanguches@admin', 'cafe@admin'));
DELETE FROM stores     WHERE user_id IN (SELECT id FROM users WHERE email IN ('sanguches@admin', 'cafe@admin'));
DELETE FROM users      WHERE email IN ('sanguches@admin', 'cafe@admin');
