-- Tablas y cambios para US_02 (Panel de administrador), basados en el MR de Daniel.
-- Depende de sql/01_usuarios.sql: ese script debe correrse primero,
-- porque aquí se referencia la tabla "usuario" que él crea.

-- Pendiente 8.3 de la US_01: falta una forma de desactivar usuarios
-- sin borrarlos. La US_02 lo pide explícitamente ("consultar, modificar
-- y desactivar usuarios"), así que se agrega aquí.

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Subtipo administrador.
CREATE TABLE IF NOT EXISTS administrador (
  id_usuario        INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
  dinero_en_cuenta  DECIMAL(12,2) NOT NULL DEFAULT 0,
  cargo             VARCHAR(80)
);

-- Subtipo vendedor.
-- codigo_caja representa el punto de venta (el MR no tiene una tabla
-- propia para esto; ver el supuesto correspondiente en docs/US_02.md).
CREATE TABLE IF NOT EXISTS vendedor (
  id_usuario   INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
  codigo_caja  VARCHAR(20),
  turno        VARCHAR(20)
);