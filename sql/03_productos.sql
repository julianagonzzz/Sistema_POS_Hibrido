-- =====================================================================
-- 03_productos.sql: Tabla de productos y datos de prueba para el catálogo
-- Incluye: Electrodomésticos, Aseo Personal, Alimentos y Moda
-- =====================================================================

-- 1. Crear tabla de productos si no existe
CREATE TABLE IF NOT EXISTS producto (
  id_producto    SERIAL PRIMARY KEY,
  nombre         VARCHAR(150) NOT NULL,
  descripcion    TEXT,
  precio         DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
  cantidad_stock INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_stock >= 0),
  categoria      VARCHAR(80) NOT NULL,
  genero         VARCHAR(20) DEFAULT 'Unisex',
  talla          VARCHAR(20) DEFAULT 'Única',
  codigo_barras  VARCHAR(50) UNIQUE,
  imagen_url     VARCHAR(255),
  activo         BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Limpiar productos previos para reinicializar pruebas limpias
TRUNCATE TABLE producto RESTART IDENTITY CASCADE;

-- 3. Insertar productos variados para todas las categorías
INSERT INTO producto (nombre, descripcion, precio, cantidad_stock, categoria, genero, talla, codigo_barras, imagen_url, activo)
VALUES
  -- ==================== ELECTRODOMÉSTICOS ====================
  (
    'Freidora de Aire Digital 4.5L',
    'Cocina saludable sin aceite con panel táctil LED, 8 programas automáticos y cesta antiadherente apta para lavavajillas.',
    289900.00,
    14,
    'Electrodomésticos',
    'Hogar',
    '4.5L',
    'PROD-ELEC-001',
    '🍳',
    TRUE
  ),
  (
    'Licuadora de Alta Potencia 600W',
    'Jarra de vidrio refractario de 1.5L, cuchillas trituradoras de acero inoxidable y 3 velocidades con función de pulso.',
    145000.00,
    20,
    'Electrodomésticos',
    'Hogar',
    '1.5L',
    'PROD-ELEC-002',
    '🍹',
    TRUE
  ),
  (
    'Cafetera de Goteo Programable',
    'Capacidad para 12 tazas, filtro permanente lavable, sistema antigoteo y placa calefactora para mantener el café caliente.',
    129900.00,
    10,
    'Electrodomésticos',
    'Hogar',
    '12 Tazas',
    'PROD-ELEC-003',
    '☕',
    TRUE
  ),
  (
    'Horno Microondas Grill 20L',
    'Potencia de 800W con función doradora grill, descongelamiento por peso y tiempo, y plato giratorio de vidrio.',
    349900.00,
    8,
    'Electrodomésticos',
    'Hogar',
    '20 Litros',
    'PROD-ELEC-004',
    '🍲',
    TRUE
  ),

  -- ==================== ASEO PERSONAL ====================
  (
    'Shampoo Nutritivo Óleo de Argán 750ml',
    'Fórmula enriquecida con aceite de argán marroquí y keratina, revitaliza cabellos secos o maltratados dejándolos sedosos.',
    24900.00,
    45,
    'Aseo Personal',
    'Unisex',
    '750 ml',
    'PROD-ASEO-001',
    '🧴',
    TRUE
  ),
  (
    'Crema Dental Total Blanqueadora 150ml',
    'Protección contra caries, placa y sarro con microcristales blanqueadores activos. Aliento fresco prolongado.',
    12500.00,
    60,
    'Aseo Personal',
    'Unisex',
    '150 ml',
    'PROD-ASEO-002',
    '🪥',
    TRUE
  ),
  (
    'Jabón Líquido Corporal Antibacterial 1L',
    'Elimina el 99.9% de bacterias mientras humecta tu piel con extractos naturales de aloe vera y glicerina.',
    18900.00,
    35,
    'Aseo Personal',
    'Unisex',
    '1 Litro',
    'PROD-ASEO-003',
    '🧼',
    TRUE
  ),
  (
    'Bloqueador Solar Facial FPS 50+ 100ml',
    'Toque seco mate, resistente al agua y sudor. Alta protección UVA/UVB sin dejar sensación grasosa en la piel.',
    48900.00,
    28,
    'Aseo Personal',
    'Unisex',
    '100 ml',
    'PROD-ASEO-004',
    '☀️',
    TRUE
  ),

  -- ==================== ALIMENTOS Y DESPENSA ====================
  (
    'Café Especial de Origen Colombiano 500g',
    'Café 100% arábica gourmet tostado en grano o molido fino. Notas acarameladas y cítricas de alta montaña.',
    32000.00,
    50,
    'Alimentos',
    'Consumo',
    '500 g',
    'PROD-ALIM-001',
    '☕',
    TRUE
  ),
  (
    'Aceite de Oliva Extra Virgen 500ml',
    'Prensado en frío de primera extracción. Acidez menor a 0.2%, perfecto para ensaladas, pastas y cocina mediterránea.',
    38500.00,
    30,
    'Alimentos',
    'Consumo',
    '500 ml',
    'PROD-ALIM-002',
    '🫒',
    TRUE
  ),
  (
    'Arroz Premium Grano Largo 5kg',
    'Arroz blanco selecto, libre de impurezas, grano entero y rendidor para toda la familia.',
    22900.00,
    70,
    'Alimentos',
    'Consumo',
    '5 kg',
    'PROD-ALIM-003',
    '🌾',
    TRUE
  ),
  (
    'Chocolate Oscuro 70% con Almendras',
    'Tableta de chocolate artesanal con cacao fino de aroma y trozos crujientes de almendra tostada. Sin gluten.',
    14500.00,
    40,
    'Alimentos',
    'Consumo',
    '100 g',
    'PROD-ALIM-004',
    '🍫',
    TRUE
  ),

  -- ==================== MODA Y CALZADO ====================
  (
    'Camisa Oxford Clásica',
    'Camisa de manga larga en algodón 100% transpirable. Corte regular fit ideal para ocasiones formales o trabajo.',
    89900.00,
    25,
    'Moda',
    'Hombre',
    'M',
    'PROD-MODA-001',
    '👔',
    TRUE
  ),
  (
    'Pantalón Denim Slim Fit',
    'Mezclilla elástica de alta durabilidad con lavado medio y 5 bolsillos. Ajuste ergonómico.',
    124900.00,
    18,
    'Moda',
    'Unisex',
    '32',
    'PROD-MODA-002',
    '👖',
    TRUE
  ),
  (
    'Chaqueta Cortavientos Urbana',
    'Chaqueta ligera con tecnología repelente al agua, capucha ajustable y bolsillos de seguridad con cremallera.',
    165000.00,
    12,
    'Moda',
    'Unisex',
    'L',
    'PROD-MODA-003',
    '🧥',
    TRUE
  ),
  (
    'Zapatos Casuales de Cuero',
    'Calzado en cuero vacuno suave con suela antideslizante y plantilla acolchada para uso prolongado.',
    189000.00,
    8,
    'Moda',
    'Hombre',
    '40',
    'PROD-MODA-004',
    '👞',
    TRUE
  );
