-- migrate:up

-- Estado de recepción de pedidos que elige el dueño: abierto | suspendido | cerrado
ALTER TABLE stores ADD COLUMN reception_status VARCHAR(20) NOT NULL DEFAULT 'abierto';
ALTER TABLE stores ADD CONSTRAINT stores_reception_status_check
    CHECK (reception_status IN ('abierto', 'suspendido', 'cerrado'));

-- migrate:down

ALTER TABLE stores DROP CONSTRAINT stores_reception_status_check;
ALTER TABLE stores DROP COLUMN reception_status;
