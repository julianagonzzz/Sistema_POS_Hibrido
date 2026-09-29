-- =====================================================================
-- SCHEMA COMPLETO DEL SISTEMA POS HÍBRIDO
-- Ejecutar este archivo completo en el SQL Editor de tu proyecto Supabase.
-- =====================================================================

-- 1. TABLAS BASE DE USUARIOS (US_01 & US_02)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    correo VARCHAR(160) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    tipo_usuario VARCHAR(15) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_usuario_correo UNIQUE (correo),
    CONSTRAINT uq_usuario_cedula UNIQUE (cedula),
    CONSTRAINT ck_usuario_tipo CHECK (
        tipo_usuario IN ('ADMIN', 'VENDEDOR', 'CLIENTE')
    )
);

CREATE TABLE IF NOT EXISTS cliente (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
    telefono VARCHAR(30),
    direccion VARCHAR(200),
    genero VARCHAR(20),
    edad INTEGER
);

CREATE TABLE IF NOT EXISTS administrador (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
    dinero_en_cuenta DECIMAL(12,2) NOT NULL DEFAULT 0,
    cargo VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS vendedor (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuario (id_usuario),
    codigo_caja VARCHAR(20),
    turno VARCHAR(20)
);

-- Modificar tabla cliente para asociar punto de venta y vendedor de registro (US_03)
ALTER TABLE cliente
    ADD COLUMN IF NOT EXISTS punto_venta VARCHAR(50),
    ADD COLUMN IF NOT EXISTS id_vendedor_registro INTEGER REFERENCES vendedor(id_usuario);


-- 2. TABLA DE PRODUCTOS (US_05 / Catálogo)
CREATE TABLE IF NOT EXISTS producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
    cantidad_stock INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_stock >= 0),
    categoria VARCHAR(80) NOT NULL,
    genero VARCHAR(20) DEFAULT 'Unisex',
    talla VARCHAR(20) DEFAULT 'Única',
    codigo_barras VARCHAR(50) UNIQUE,
    imagen_url VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);


-- 3. TABLAS DE VENTAS (US_04)
CREATE TABLE IF NOT EXISTS venta (
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES usuario(id_usuario),
    id_vendedor INTEGER REFERENCES vendedor(id_usuario),
    codigo_caja VARCHAR(20) NOT NULL,
    medio_pago VARCHAR(30) NOT NULL CHECK (medio_pago IN ('EFECTIVO', 'DATAFONO', 'NEQUI', 'TRANSFERENCIA')),
    canal VARCHAR(20) NOT NULL DEFAULT 'FISICO',
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    impuesto DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (impuesto >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA'
);

CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Índices de ventas
CREATE INDEX IF NOT EXISTS idx_venta_cliente ON venta(id_cliente);
CREATE INDEX IF NOT EXISTS idx_venta_vendedor ON venta(id_vendedor);
CREATE INDEX IF NOT EXISTS idx_venta_fecha ON venta(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta ON detalle_venta(id_venta);


-- 4. LIMPIEZA E INSERCIÓN DE PRODUCTOS SEMILLA
TRUNCATE TABLE producto RESTART IDENTITY CASCADE;

INSERT INTO producto (nombre, descripcion, precio, cantidad_stock, categoria, genero, talla, codigo_barras, imagen_url, activo)
VALUES
  -- ELECTRODOMÉSTICOS
  (
    'Freidora de Aire Digital 4.5L',
    'Cocina saludable sin aceite con panel táctil LED, 8 programas automáticos y cesta antiadherente apta para lavavajillas.',
    289900.00, 14, 'Electrodomésticos', 'Hogar', '4.5L', 'PROD-ELEC-001', '🍳', TRUE
  ),
  (
    'Licuadora de Alta Potencia 600W',
    'Jarra de vidrio refractario de 1.5L, cuchillas trituradoras de acero inoxidable y 3 velocidades con función de pulso.',
    145000.00, 20, 'Electrodomésticos', 'Hogar', '1.5L', 'PROD-ELEC-002', '🍹', TRUE
  ),
  (
    'Cafetera de Goteo Programable',
    'Capacidad para 12 tazas, filtro permanente lavable, sistema antigoteo y placa calefactora para mantener el café caliente.',
    129900.00, 10, 'Electrodomésticos', 'Hogar', '12 Tazas', 'PROD-ELEC-003', '☕', TRUE
  ),
  (
    'Horno Microondas Grill 20L',
    'Potencia de 800W con función doradora grill, descongelamiento por peso y tiempo, y plato giratorio de vidrio.',
    349900.00, 8, 'Electrodomésticos', 'Hogar', '20 Litros', 'PROD-ELEC-004', '🍲', TRUE
  ),

  -- ASEO PERSONAL
  (
    'Shampoo Nutritivo Óleo de Argán 750ml',
    'Fórmula enriquecida con aceite de argán marroquí y keratina, revitaliza cabellos secos o maltratados dejándolos sedosos.',
    24900.00, 45, 'Aseo Personal', 'Unisex', '750 ml', 'PROD-ASEO-001', '🧴', TRUE
  ),
  (
    'Crema Dental Total Blanqueadora 150ml',
    'Protección contra caries, placa y sarro con microcristales blanqueadores activos. Aliento fresco prolongado.',
    12500.00, 60, 'Aseo Personal', 'Unisex', '150 ml', 'PROD-ASEO-002', '🪥', TRUE
  ),
  (
    'Jabón Líquido Corporal Antibacterial 1L',
    'Elimina el 99.9% de bacterias mientras humecta tu piel con extractos naturales de aloe vera y glicerina.',
    18900.00, 35, 'Aseo Personal', 'Unisex', '1 Litro', 'PROD-ASEO-003', '🧼', TRUE
  ),
  (
    'Bloqueador Solar Facial FPS 50+ 100ml',
    'Toque seco mate, resistente al agua y sudor. Alta protección UVA/UVB sin dejar sensación grasosa en la piel.',
    48900.00, 28, 'Aseo Personal', 'Unisex', '100 ml', 'PROD-ASEO-004', '☀️', TRUE
  ),

  -- ALIMENTOS Y DESPENSA
  (
    'Café Especial de Origen Colombiano 500g',
    'Café 100% arábica gourmet tostado en grano o molido fino. Notas acarameladas y cítricas de alta montaña.',
    32000.00, 50, 'Alimentos', 'Consumo', '500 g', 'PROD-ALIM-001', '☕', TRUE
  ),
  (
    'Aceite de Oliva Extra Virgen 500ml',
    'Prensado en frío de primera extracción. Acidez menor a 0.2%, perfecto para ensaladas, pastas y cocina mediterránea.',
    38500.00, 30, 'Alimentos', 'Consumo', '500 ml', 'PROD-ALIM-002', '🫒', TRUE
  ),
  (
    'Arroz Premium Grano Largo 5kg',
    'Arroz blanco selecto, libre de impurezas, grano entero y rendidor para toda la familia.',
    22900.00, 70, 'Alimentos', 'Consumo', '500 kg', 'PROD-ALIM-003', '🌾', TRUE
  ),
  (
    'Chocolate Oscuro 70% con Almendras',
    'Tableta de chocolate artesanal con cacao fino de aroma y trozos crujientes de almendra tostada. Sin gluten.',
    14500.00, 40, 'Alimentos', 'Consumo', '100 g', 'PROD-ALIM-004', '🍫', TRUE
  ),

  -- MODA Y CALZADO
  (
    'Camisa Oxford Clásica',
    'Camisa de manga larga en algodón 100% transpirable. Corte regular fit ideal para ocasiones formales o trabajo.',
    89900.00, 25, 'Moda', 'Hombre', 'M', 'PROD-MODA-001', '👔', TRUE
  ),
  (
    'Pantalón Denim Slim Fit',
    'Mezclilla elástica de alta durabilidad con lavado medio y 5 bolsillos. Ajuste ergonómico.',
    124900.00, 18, 'Moda', 'Unisex', '32', 'PROD-MODA-002', '👖', TRUE
  ),
  (
    'Chaqueta Cortavientos Urbana',
    'Chaqueta ligera con tecnología repelente al agua, capucha ajustable y bolsillos de seguridad con cremallera.',
    165000.00, 12, 'Moda', 'Unisex', 'L', 'PROD-MODA-003', '🧥', TRUE
  ),
  (
    'Zapatos Casuales de Cuero',
    'Calzado en cuero vacuno suave con suela antideslizante y plantilla acolchada para uso prolongado.',
    189000.00, 8, 'Moda', 'Hombre', '40', 'PROD-MODA-004', '👞', TRUE
  );


-- 5. LIMPIEZA E INSERCIÓN DE USUARIOS SEMILLA
TRUNCATE TABLE detalle_venta, venta, cliente, vendedor, administrador, usuario RESTART IDENTITY CASCADE;

INSERT INTO usuario (id_usuario, correo, contrasena, nombre, cedula, tipo_usuario, activo)
VALUES
  -- 1 ADMINISTRADOR (Contraseña: Admin123*)
  (
    1,
    'admin@pos.com',
    '$2b$10$kkhtzlRF3IgBPTV9kpR7muQWQExoB8BAy6Fzm52Yvo1B8u7mRlCWu',
    'Carlos Administrador',
    '10010001',
    'ADMIN',
    TRUE
  ),

  -- 2 VENDEDORES (Contraseña: Seller123*)
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

  -- 3 CLIENTES (Contraseña: Cliente123*)
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

-- Sincronizar secuencia de ids de usuario
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));

-- Subtipo ADMINISTRADOR
INSERT INTO administrador (id_usuario, dinero_en_cuenta, cargo)
VALUES
  (1, 0.00, 'Gerente de Sucursal');

-- Subtipo VENDEDOR
INSERT INTO vendedor (id_usuario, codigo_caja, turno)
VALUES
  (2, 'CAJA-01', 'MAÑANA'),
  (3, 'CAJA-02', 'TARDE');

-- Subtipo CLIENTE
INSERT INTO cliente (id_usuario, telefono, direccion, genero, edad, punto_venta, id_vendedor_registro)
VALUES
  (4, '3101234567', 'Calle 45 # 12-30, Cali', 'Femenino', 28, 'CAJA-01', 2),
  (5, '3207654321', 'Carrera 15 # 80-22, Cali', 'Masculino', 34, 'CAJA-01', 2),
  (6, '3159876543', 'Avenida 6N # 25-10, Cali', 'Femenino', 24, 'CAJA-02', 3);
