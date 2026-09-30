-- =====================================================================
-- 03_productos_ktronix.sql: Catálogo Tematizado Electrónica y Tecnología
-- Estilo: Ktronix / Katronix (Celulares, Computadores, TVs, Gaming, Accesorios, Electrohogar)
-- =====================================================================

-- 1. Ampliar longitud de columnas si es necesario para especificaciones y URLs
ALTER TABLE producto ALTER COLUMN talla TYPE VARCHAR(50);
ALTER TABLE producto ALTER COLUMN genero TYPE VARCHAR(50);
ALTER TABLE producto ALTER COLUMN imagen_url TYPE VARCHAR(500);

-- 2. Limpiar productos anteriores y reiniciar contador ID
-- Si hay ventas de prueba previas, se eliminan en cascada para empezar limpio:
TRUNCATE TABLE detalle_venta, venta, producto RESTART IDENTITY CASCADE;

-- 3. Insertar Catálogo Especializado Katronix
INSERT INTO producto (nombre, descripcion, precio, cantidad_stock, stock_minimo, categoria, genero, talla, codigo_barras, imagen_url, activo)
VALUES
  -- ==================== CELULARES Y SMARTPHONES ====================
  (
    'Apple iPhone 16 Pro Max 256GB',
    'Pantalla Super Retina XDR OLED 6.9", chip A18 Pro, cuerpo en titanio color azul oscuro, cámara fusion de 48MP con zoom óptico 5x y botón de control de cámara.',
    6299900.00,
    18,
    4,
    'Celulares',
    'Apple',
    '256 GB',
    '7701001001',
    '/images/productos/iphone-16-pro-max-azul.png',
    TRUE
  ),
  (
    'Samsung Galaxy S24 Ultra 512GB',
    'Pantalla Dynamic AMOLED 2X 6.8" 120Hz, procesador Snapdragon 8 Gen 3 for Galaxy, cámara 200MP con Galaxy AI integrada y S-Pen incluido.',
    5499900.00,
    15,
    3,
    'Celulares',
    'Samsung',
    '512 GB',
    '7701001002',
    '📱',
    TRUE
  ),
  (
    'Xiaomi Redmi Note 13 Pro+ 5G 256GB',
    'Cámara ultranítida de 200MP con OIS, carga hiperrápida de 120W HyperCharge, pantalla curva AMOLED 1.5K 120Hz y resistencia IP68.',
    1899900.00,
    25,
    5,
    'Celulares',
    'Xiaomi',
    '256 GB',
    '7701001003',
    '📱',
    TRUE
  ),
  (
    'Apple Watch Series 9 GPS 45mm',
    'Caja de aluminio en color medianoche, pantalla retina siempre activa brillante, gesto de doble toque, sensor de oxígeno y ECG.',
    1999900.00,
    12,
    3,
    'Celulares',
    'Apple',
    '45 mm',
    '7701001004',
    '⌚',
    TRUE
  ),

  -- ==================== COMPUTADORES E INFORMÁTICA ====================
  (
    'Portátil HP 15.6" Potenciado para IA',
    'Procesador Intel Core Ultra con NPU dedicada para Inteligencia Artificial, 16GB RAM DDR5, 512GB SSD NVMe, pantalla FHD antirreflejo y teclado numérico.',
    3499900.00,
    14,
    3,
    'Computadores',
    'HP',
    '15.6" Core Ultra',
    '7702002001',
    '/images/productos/hp-laptop-ia-15.png',
    TRUE
  ),
  (
    'Portátil Gamer ASUS ROG Strix G16',
    'Pantalla 16" ROG Nebula QHD 240Hz, procesador Intel Core i9-14900HX, gráfica NVIDIA GeForce RTX 4060 8GB, 16GB RAM y 1TB SSD.',
    6899900.00,
    8,
    2,
    'Computadores',
    'ASUS',
    '16" RTX 4060',
    '7702002002',
    '💻',
    TRUE
  ),
  (
    'MacBook Air 13" Apple Silicon M3',
    'Chip M3 de 8 núcleos CPU y 10 núcleos GPU, 16GB memoria unificada, 512GB SSD, diseño ultra delgado sin ventilador y hasta 18h de batería.',
    5899900.00,
    10,
    2,
    'Computadores',
    'Apple',
    '13.6" M3',
    '7702002003',
    '💻',
    TRUE
  ),
  (
    'Monitor Gamer Samsung Odyssey G5 27"',
    'Panel VA curvo 1000R resolución WQHD (2560x1440), tasa de refresco 165Hz, tiempo de respuesta 1ms (MPRT) y soporte AMD FreeSync Premium.',
    1299900.00,
    16,
    4,
    'Computadores',
    'Samsung',
    '27" Curvo 165Hz',
    '7702002004',
    '🖥️',
    TRUE
  ),

  -- ==================== TELEVISORES, AUDIO Y VIDEO ====================
  (
    'Smart TV Samsung 65" Crystal UHD 4K',
    'Procesador Crystal 4K, tecnología Dynamic Crystal Color para mil millones de tonos, diseño AirSlim ultradelgado, Gaming Hub y SmartThings integrado.',
    2799900.00,
    9,
    2,
    'Televisores',
    'Samsung',
    '65 Pulgadas 4K',
    '7703003001',
    '/images/productos/samsung-tv-crystal-uhd-65.png',
    TRUE
  ),
  (
    'Smart TV LG OLED evo 55" 4K Serie C3',
    'Píxeles autoiluminados con negros perfectos y contraste infinito, procesador a9 AI Gen6 4K, 120Hz, Dolby Vision & Dolby Atmos y HDMI 2.1.',
    4999900.00,
    6,
    2,
    'Televisores',
    'LG',
    '55" OLED 4K',
    '7703003002',
    '📺',
    TRUE
  ),
  (
    'Barra de Sonido JBL Bar 500 Dolby Atmos',
    'Sistema 5.1 canales con potencia total de 590W, subwoofer inalámbrico de 10 pulgadas, tecnología PureVoice y conectividad Wi-Fi con AirPlay y Chromecast.',
    1899900.00,
    11,
    3,
    'Televisores',
    'JBL',
    '590W 5.1ch',
    '7703003003',
    '🔊',
    TRUE
  ),
  (
    'Parlante Portátil Bluetooth JBL Charge 5',
    'Sonido Pro Original JBL con driver de gran excursión y dos radiadores pasivos, hasta 20 horas de reproducción continua, banco de energía y resistencia IP67.',
    649900.00,
    22,
    5,
    'Televisores',
    'JBL',
    'Portátil IP67',
    '7703003004',
    '📻',
    TRUE
  ),

  -- ==================== VIDEOJUEGOS Y CONSOLAS ====================
  (
    'Control Inalámbrico PS5 DualSense Midnight Black',
    'Gatillos adaptativos con resistencia dinámica, retroalimentación háptica inmersiva, micrófono integrado y conector de 3.5mm para audífonos.',
    349900.00,
    30,
    6,
    'Videojuegos',
    'PlayStation',
    'PS5 Midnight',
    '7704004001',
    '/images/productos/ps5-control-dualsense-negro.png',
    TRUE
  ),
  (
    'Consola PlayStation 5 Slim 1TB Digital',
    'Unidad SSD ultrarrápida de 1TB, trazado de rayos por hardware, audio 3D Tempest, soporte hasta 120fps a 4K e incluye mando DualSense blanco.',
    2499900.00,
    10,
    3,
    'Videojuegos',
    'PlayStation',
    '1 TB SSD',
    '7704004002',
    '🎮',
    TRUE
  ),
  (
    'Consola Nintendo Switch OLED Neón',
    'Pantalla OLED vibrante de 7 pulgadas, soporte ancho ajustable para modo sobremesa, base con puerto LAN por cable, 64GB de almacenamiento interno.',
    1699900.00,
    14,
    4,
    'Videojuegos',
    'Nintendo',
    '7" OLED 64GB',
    '7704004003',
    '🎮',
    TRUE
  ),
  (
    'Auriculares Gamer HyperX Cloud II Wireless',
    'Conexión inalámbrica 2.4GHz de baja latencia con hasta 30 horas de batería, transductores de 53mm, sonido envolvente virtual 7.1 y marco de aluminio duradero.',
    529900.00,
    18,
    4,
    'Videojuegos',
    'HyperX',
    'Wireless 7.1',
    '7704004004',
    '🎧',
    TRUE
  ),

  -- ==================== ACCESORIOS Y PERIFÉRICOS ====================
  (
    'Mouse Gamer Logitech G305 Lightspeed Lila',
    'Sensor óptico HERO de 12.000 DPI con precisión milimétrica, tecnología inalámbrica LIGHTSPEED de 1 ms, peso ultraligero de 99g y 250 horas de autonomía.',
    199900.00,
    35,
    8,
    'Accesorios',
    'Logitech',
    'Inalámbrico',
    '7705005001',
    '/images/productos/mouse-logitech-g305-lila.png',
    TRUE
  ),
  (
    'Teclado Mecánico RGB Redragon Kumara K552',
    'Switches mecánicos Outemu Blue con respuesta táctil audible, retroiluminación RGB configurable, teclas de doble inyección y estructura de acero reforzada.',
    189900.00,
    28,
    6,
    'Accesorios',
    'Redragon',
    'Mecánico TKL',
    '7705005002',
    '⌨️',
    TRUE
  ),
  (
    'Mouse Pad Gamer HyperX Pulsefire Mat XL',
    'Superficie de tela de tejido denso optimizada para seguimiento de precisión, bordes cosidos antidesgaste y base de goma texturizada antideslizante (900x420mm).',
    89900.00,
    40,
    8,
    'Accesorios',
    'HyperX',
    'Tamaño XL',
    '7705005003',
    '⬛',
    TRUE
  ),
  (
    'Hub Multipuerto USB-C Anker 7 en 1',
    'Entrada USB-C con Power Delivery de 100W, salida HDMI 4K a 60Hz, 2 puertos USB-A 3.0 de alta velocidad, lector de tarjetas SD y microSD.',
    159900.00,
    25,
    5,
    'Accesorios',
    'Anker',
    '7 en 1 4K',
    '7705005004',
    '🔌',
    TRUE
  ),

  -- ==================== ELECTRODOMÉSTICOS Y SMART HOME ====================
  (
    'Freidora de Aire Philips Airfryer XXL 7.2L Conectada',
    'Tecnología Rapid Air para frituras crujientes con 90% menos grasa, conectividad Wi-Fi con la app NutriU, 16 programas preestablecidos y capacidad familiar.',
    699900.00,
    16,
    3,
    'Electrodomésticos',
    'Philips',
    '7.2 Litros XXL',
    '7706006001',
    '🍳',
    TRUE
  ),
  (
    'Cafetera Expresso De''Longhi Dedica Deluxe',
    'Bomba tradicional de 15 bares, sistema de calentamiento rápido Thermoblock, vaporizador manual ajustable para cappuccino y calentador de tazas superior.',
    1199900.00,
    8,
    2,
    'Electrodomésticos',
    'DeLonghi',
    '15 Bares Acero',
    '7706006002',
    '☕',
    TRUE
  ),
  (
    'Aspiradora Robot Xiaomi Vacuum E10 con Mapeo',
    'Potencia de succión de 4000Pa, sistema de navegación giroscópica con sensores anticaída, depósito mixto 2 en 1 (aspira y trapea) con control por app Xiaomi Home.',
    799900.00,
    12,
    3,
    'Electrodomésticos',
    'Xiaomi',
    'Smart 4000Pa',
    '7706006003',
    '🤖',
    TRUE
  ),
  (
    'Horno Microondas Inverter Panasonic 32L Grill',
    'Tecnología Inverter de cocción homogénea continua sin resecar los alimentos, función dorador Grill de 1000W, descongelado Turbo y cavidad de fácil limpieza.',
    589900.00,
    10,
    2,
    'Electrodomésticos',
    'Panasonic',
    '32L con Grill',
    '7706006004',
    '🍲',
    TRUE
  );
