-- Tablas US_01, basadas en el MR.
-- Recordatorio (para mí jeje): en Postgres los nombres sin comillas se guardan en minúscula,
-- así que "Usuario" del diagrama = tabla "usuario" en el código.

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario   SERIAL PRIMARY KEY,
  correo       VARCHAR(160) NOT NULL,
  contrasena   VARCHAR(255) NOT NULL,   -- guarda el HASH de bcrypt (60 caracteres)
  nombre       VARCHAR(120) NOT NULL,
  cedula       VARCHAR(20)  NOT NULL,
  tipo_usuario VARCHAR(15)  NOT NULL,

  CONSTRAINT uq_usuario_correo UNIQUE (correo),
  CONSTRAINT uq_usuario_cedula UNIQUE (cedula),
  CONSTRAINT ck_usuario_tipo   CHECK (tipo_usuario IN ('ADMIN', 'VENDEDOR', 'CLIENTE'))
);

CREATE TABLE IF NOT EXISTS cliente (
  id_usuario INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
  telefono   VARCHAR(30),
  direccion  VARCHAR(200),
  genero     VARCHAR(20),
  edad       INTEGER
);