-- migrate:up

-- Mismos 3 usuarios que estaban fijos en website/controllers.js.
-- Contraseñas en texto plano SOLO mientras se desarrolla (pendiente cifrar).
INSERT INTO users (email, phone, password, status, role_id) VALUES
  ('admin@admin',       NULL, '123', 'activo', (SELECT id FROM roles WHERE name = 'enterprises')),
  ('x@x',               NULL, '123', 'activo', (SELECT id FROM roles WHERE name = 'owner')),
  ('comensal@comensal', NULL, '123', 'activo', (SELECT id FROM roles WHERE name = 'comensal'));

-- Perfil de local para el usuario enterprises
INSERT INTO stores (commercial_name, campus_location, operative_status, user_id)
SELECT 'Local de prueba', 'Campus', 'activo', id FROM users WHERE email = 'admin@admin';

-- Perfil de comensal para el usuario comensal
INSERT INTO diners (first_name, last_name, user_id)
SELECT 'Comensal', 'Demo', id FROM users WHERE email = 'comensal@comensal';

-- migrate:down

DELETE FROM diners WHERE user_id IN (SELECT id FROM users WHERE email = 'comensal@comensal');
DELETE FROM stores WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@admin');
DELETE FROM users  WHERE email IN ('admin@admin', 'x@x', 'comensal@comensal');
