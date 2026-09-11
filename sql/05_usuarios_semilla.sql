-- =====================================================================
-- 05_usuarios_semilla.sql: Datos de prueba para usuarios del sistema
-- Incluye: 1 Administrador, 2 Vendedores y 3 Clientes
-- =====================================================================

-- 1. Limpiar usuarios previos y sus subtipos (resetea los IDs en 1)
-- También limpia ventas previas para mantener consistencia de llaves foráneas
TRUNCATE TABLE detalle_venta, venta, cliente, vendedor, administrador, usuario RESTART IDENTITY CASCADE;

-- 2. Insertar usuarios base en la tabla 'usuario'
-- Contraseñas hasheadas con bcrypt (costo 10):
--   Admin123*   -> $2b$10$kkhtzlRF3IgBPTV9kpR7muQWQExoB8BAy6Fzm52Yvo1B8u7mRlCWu
--   Seller123*  -> $2b$10$ks6o7Gac3DTF3JVS7gHlg.wFeMkc7EXVdD3tlTMu.IwUCdDl0eiwu
--   Cliente123* -> $2b$10$3nW7bBxMYqm0g9DouOSuieVfrHoN2.JO9Blx1rLZtS/oJ0GVhVfbi

INSERT INTO usuario (id_usuario, correo, contrasena, nombre, cedula, tipo_usuario, activo)
VALUES
  -- 1 ADMINISTRADOR
  (
    1,
    'admin@pos.com',
    '$2b$10$kkhtzlRF3IgBPTV9kpR7muQWQExoB8BAy6Fzm52Yvo1B8u7mRlCWu',
    'Carlos Administrador',
    '10010001',
    'ADMIN',
    TRUE
  ),

  -- 2 VENDEDORES (CAJEROS)
  (
    2,
    'seller1@pos.com',
    '$2b$10$ks6o7Gac3DTF3JVS7gHlg.wFeMkc7EXVdD3tlTMu.IwUCdDl0eiwu',
    'Laura Vendedora',
    '20020001',
    'VENDEDOR',
    TRUE
  ),
  (
    3,
    'seller2@pos.com',
    '$2b$10$ks6o7Gac3DTF3JVS7gHlg.wFeMkc7EXVdD3tlTMu.IwUCdDl0eiwu',
    'Andrés Cajero',
    '20020002',
    'VENDEDOR',
    TRUE
  ),

  -- 3 CLIENTES
  (
    4,
    'cliente1@pos.com',
    '$2b$10$3nW7bBxMYqm0g9DouOSuieVfrHoN2.JO9Blx1rLZtS/oJ0GVhVfbi',
    'María Gómez',
    '30030001',
    'CLIENTE',
    TRUE
  ),
  (
    5,
    'cliente2@pos.com',
    '$2b$10$3nW7bBxMYqm0g9DouOSuieVfrHoN2.JO9Blx1rLZtS/oJ0GVhVfbi',
    'Juan Rodríguez',
    '30030002',
    'CLIENTE',
    TRUE
  ),
  (
    6,
    'cliente3@pos.com',
    '$2b$10$3nW7bBxMYqm0g9DouOSuieVfrHoN2.JO9Blx1rLZtS/oJ0GVhVfbi',
    'Valentina López',
    '30030003',
    'CLIENTE',
    TRUE
  );

-- Ajustar la secuencia de id_usuario al último valor insertado
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));

-- 3. Insertar información de subtipo ADMINISTRADOR
INSERT INTO administrador (id_usuario, dinero_en_cuenta, cargo)
VALUES
  (1, 0.00, 'Gerente de Sucursal');

-- 4. Insertar información de subtipo VENDEDOR
INSERT INTO vendedor (id_usuario, codigo_caja, turno)
VALUES
  (2, 'CAJA-01', 'MAÑANA'),
  (3, 'CAJA-02', 'TARDE');

-- 5. Insertar información de subtipo CLIENTE (con punto de venta y vendedor asociado)
INSERT INTO cliente (id_usuario, telefono, direccion, genero, edad, punto_venta, id_vendedor_registro)
VALUES
  (4, '3101234567', 'Calle 45 # 12-30, Cali', 'Femenino', 28, 'CAJA-01', 2),
  (5, '3207654321', 'Carrera 15 # 80-22, Cali', 'Masculino', 34, 'CAJA-01', 2),
  (6, '3159876543', 'Avenida 6N # 25-10, Cali', 'Femenino', 24, 'CAJA-02', 3);
