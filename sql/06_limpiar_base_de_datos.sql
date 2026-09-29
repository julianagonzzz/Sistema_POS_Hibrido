-- =====================================================================
-- LIMPIEZA Y MANTENIMIENTO DE LA BASE DE DATOS
-- Archivo: sql/06_limpiar_base_de_datos.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- OPCIÓN A: VACIAR TODOS LOS DATOS (Base de datos 100% limpia)
-- Borra ventas, productos, clientes, vendedores y administradores.
-- Reinicia los contadores (id_usuario, id_producto, id_venta) a 1.
-- Las tablas y columnas se conservan.
-- ---------------------------------------------------------------------
TRUNCATE TABLE detalle_venta, venta, cliente, vendedor, administrador, usuario, producto RESTART IDENTITY CASCADE;


-- ---------------------------------------------------------------------
-- OPCIÓN B: LIMPIAR TODO PERO DEJAR SOLO EL USUARIO ADMINISTRADOR
-- Útil para empezar en limpio pero pudiendo entrar al sistema de inmediato.
-- Descomenta este bloque si deseas usarlo:
-- ---------------------------------------------------------------------
/*
TRUNCATE TABLE detalle_venta, venta, cliente, vendedor, administrador, usuario, producto RESTART IDENTITY CASCADE;

-- Insertar administrador inicial (admin@pos.com / Admin123*)
INSERT INTO usuario (id_usuario, correo, contrasena, nombre, cedula, tipo_usuario, activo)
VALUES (
    1,
    'admin@pos.com',
    '$2b$10$kkhtzlRF3IgBPTV9kpR7muQWQExoB8BAy6Fzm52Yvo1B8u7mRlCWu',
    'Carlos Administrador',
    '10010001',
    'ADMIN',
    TRUE
);
SELECT setval('usuario_id_usuario_seq', 1);

INSERT INTO administrador (id_usuario, dinero_en_cuenta, cargo)
VALUES (1, 0.00, 'Administrador General');
*/


-- ---------------------------------------------------------------------
-- OPCIÓN C: VACIAR SOLO VENTAS Y DETALLES (Mantener usuarios y catálogo)
-- Útil si hiciste pruebas de compra y quieres reiniciar el historial de ventas
-- a 0 sin perder el inventario ni los usuarios creados.
-- ---------------------------------------------------------------------
/*
TRUNCATE TABLE detalle_venta, venta RESTART IDENTITY CASCADE;
*/


-- ---------------------------------------------------------------------
-- OPCIÓN D: RESET TOTAL (DROP DE TODAS LAS TABLAS)
-- Elimina por completo las tablas, llaves foráneas e índices.
-- Úsalo solo si quieres rehacer el esquema ejecutando 'schema_completo.sql' de nuevo.
-- ---------------------------------------------------------------------
/*
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS venta CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS vendedor CASCADE;
DROP TABLE IF EXISTS administrador CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
*/
