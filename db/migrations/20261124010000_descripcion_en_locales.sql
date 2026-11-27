-- migrate:up

-- Descripción del local (pantalla "Editar perfil del local", máximo 240 caracteres)
ALTER TABLE stores ADD COLUMN description VARCHAR(240);

-- migrate:down

ALTER TABLE stores DROP COLUMN description;
