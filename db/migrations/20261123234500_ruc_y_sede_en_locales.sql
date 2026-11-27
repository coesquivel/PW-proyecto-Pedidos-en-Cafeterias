-- migrate:up

-- Datos que pide el formulario "Registra tu local": RUC y sede.
-- Los locales ya existentes quedan sin RUC (NULL) y en la sede Monterrico.
ALTER TABLE stores ADD COLUMN ruc    VARCHAR(11) UNIQUE;
ALTER TABLE stores ADD COLUMN campus VARCHAR(30) NOT NULL DEFAULT 'Monterrico';

-- migrate:down

ALTER TABLE stores DROP COLUMN campus;
ALTER TABLE stores DROP COLUMN ruc;
