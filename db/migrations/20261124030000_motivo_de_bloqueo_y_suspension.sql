-- migrate:up

-- Motivo con el que el owner bloquea un comensal o suspende un local
ALTER TABLE users ADD COLUMN status_reason VARCHAR(300);
ALTER TABLE stores ADD COLUMN status_reason VARCHAR(300);

-- migrate:down

ALTER TABLE stores DROP COLUMN status_reason;
ALTER TABLE users DROP COLUMN status_reason;
