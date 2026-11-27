-- migrate:up

-- Horario de ejemplo para los locales que ya existen:
-- lunes a viernes 07:00-19:00, sábado 08:00-13:00, domingo cerrado.
-- (day_of_week: 1 = lunes ... 7 = domingo). Cada local lo edita en "Horario de atención".
INSERT INTO store_schedules (day_of_week, open_time, close_time, is_closed, store_id)
SELECT d.day_of_week, d.open_time, d.close_time, d.is_closed, s.id
FROM stores s
CROSS JOIN (VALUES
  (1, TIME '07:00', TIME '19:00', FALSE),
  (2, TIME '07:00', TIME '19:00', FALSE),
  (3, TIME '07:00', TIME '19:00', FALSE),
  (4, TIME '07:00', TIME '19:00', FALSE),
  (5, TIME '07:00', TIME '19:00', FALSE),
  (6, TIME '08:00', TIME '13:00', FALSE),
  (7, NULL::time,   NULL::time,   TRUE)
) AS d(day_of_week, open_time, close_time, is_closed)
WHERE NOT EXISTS (SELECT 1 FROM store_schedules ss WHERE ss.store_id = s.id);

-- migrate:down

DELETE FROM store_schedules;
