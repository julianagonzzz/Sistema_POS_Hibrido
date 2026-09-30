-- =====================================================================
-- 03_productos_ktronix.sql: Catálogo Exclusivo con Fotos Personalizadas
-- Solo productos con imágenes reales (Sin emojis)
-- =====================================================================

-- 1. Asegurar longitud suficiente en columnas
ALTER TABLE producto ALTER COLUMN talla TYPE VARCHAR(80);
ALTER TABLE producto ALTER COLUMN genero TYPE VARCHAR(80);
ALTER TABLE producto ALTER COLUMN imagen_url TYPE VARCHAR(500);

-- 2. Limpiar productos previos para dejar únicamente los que tienen fotos reales
TRUNCATE TABLE detalle_venta, venta, producto RESTART IDENTITY CASCADE;

-- 3. Insertar Catálogo 100% con Fotografías Reales
INSERT INTO producto (nombre, descripcion, precio, cantidad_stock, stock_minimo, categoria, genero, talla, codigo_barras, imagen_url, activo)
VALUES
  -- ==================== 1. CELULARES & SMARTPHONES ====================
  (
    'Apple iPhone 16 Pro Max 256GB',
    'Pantalla Super Retina XDR OLED 6.9", chip A18 Pro, cuerpo en titanio color azul oscuro, cámara fusion de 48MP con zoom óptico 5x y nuevo botón Camera Control.',
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

  -- ==================== 2. COMPUTADORES E INFORMÁTICA ====================
  (
    'Portátil HP 15.6" Potenciado para IA',
    'Procesador Intel Core Ultra con unidad de procesamiento neuronal NPU para Inteligencia Artificial, 16GB RAM DDR5, 512GB SSD NVMe y pantalla FHD antirreflejo.',
    3499900.00,
    14,
    3,
    'Computadores',
    'HP',
    '15.6" Core Ultra IA',
    '7702002001',
    '/images/productos/hp-laptop-ia-15.png',
    TRUE
  ),

  -- ==================== 3. TELEVISORES & AUDIO ====================
  (
    'Smart TV Samsung 65" Crystal UHD 4K',
    'Procesador Crystal 4K, tecnología Dynamic Crystal Color para mil millones de tonos, diseño AirSlim ultradelgado, Gaming Hub y plataforma SmartThings.',
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
    'Audífonos Inalámbricos Sony Noise Cancelling',
    'Cancelación activa de ruido con procesador V1, controladores dinámicos de alta fidelidad, conexión multipunto, llamadas ultranítidas y hasta 35 horas de batería.',
    599900.00,
    24,
    5,
    'Televisores',
    'Sony',
    'Inalámbrico ANC',
    '7703003002',
    '/images/productos/audifonos-sony-wh-noise-cancelling.png',
    TRUE
  ),

  -- ==================== 4. VIDEOJUEGOS & GAMING ====================
  (
    'Control Inalámbrico PS5 DualSense Midnight Black',
    'Gatillos adaptativos con resistencia dinámica, respuesta háptica inmersiva de alta precisión, micrófono incorporado y batería recargable por USB-C.',
    349900.00,
    30,
    6,
    'Videojuegos',
    'PlayStation',
    'Midnight Black',
    '7704004001',
    '/images/productos/ps5-control-dualsense-negro.png',
    TRUE
  ),

  -- ==================== 5. ACCESORIOS & FOTOGRAFÍA ====================
  (
    'Mouse Gamer Logitech G305 Lightspeed Lila',
    'Sensor óptico HERO con hasta 12.000 DPI, tasa de respuesta ultra veloz de 1ms Lightspeed inalámbrico, peso ultraligero de 99g y 250 horas continuas con 1 pila AA.',
    199900.00,
    35,
    8,
    'Accesorios',
    'Logitech',
    'Inalámbrico 12K DPI',
    '7705005001',
    '/images/productos/mouse-logitech-g305-lila.png',
    TRUE
  ),
  (
    'Audífonos Diadema Apple AirPods Max Negro Espacial',
    'Audio espacial personalizado con seguimiento dinámico de la cabeza, transductor dinámico diseñado por Apple, cancelación activa de ruido pro y modo ambiente.',
    2899900.00,
    11,
    3,
    'Accesorios',
    'Apple',
    'Over-Ear ANC',
    '7705005002',
    '/images/productos/audifonos-apple-airpods-max-negro.png',
    TRUE
  ),
  (
    'Cámara Réflex Canon EOS Rebel T7 con Lente 18-55mm',
    'Sensor CMOS APS-C de 24.1 megapíxeles, procesador DIGIC 4+, grabación de video Full HD 1080p, visor óptico con AF de 9 puntos y conectividad Wi-Fi y NFC.',
    2499900.00,
    8,
    2,
    'Accesorios',
    'Canon',
    'Kit Lente 18-55mm',
    '7705005003',
    '/images/productos/camara-canon-eos-rebel-t7.png',
    TRUE
  ),

  -- ==================== 6. ELECTRODOMÉSTICOS & SMART HOME ====================
  (
    'Freidora de Aire Ninja Foodi DualZone 7.6L',
    '2 cestas independientes para cocinar 2 alimentos de 2 formas simultáneamente con tecnología Smart Finish, 6 funciones programables y 1690W de potencia.',
    899900.00,
    16,
    3,
    'Electrodomésticos',
    'Ninja',
    '7.6L Doble Cesta',
    '7706006001',
    '/images/productos/freidora-ninja-dualzone-doble-cesta.png',
    TRUE
  ),
  (
    'Cámara de Seguridad Wi-Fi TP-Link Tapo 360°',
    'Resolución nítida 1080p Full HD, rotación horizontal de 360° y vertical de 114°, visión nocturna avanzada hasta 9 metros, detección de movimiento y audio bidireccional.',
    149900.00,
    40,
    8,
    'Electrodomésticos',
    'TP-Link',
    '360° Smart Home',
    '7706006002',
    '/images/productos/camara-seguridad-tapo-wifi-360.png',
    TRUE
  ),
  (
    'Secador de Cabello Remington Iónico Profesional 2200W',
    'Tecnología iónica con rejilla recubierta de cerámica para un secado rápido sin frizz y máximo brillo, 3 ajustes de calor, 2 velocidades y ráfaga de aire frío.',
    189900.00,
    28,
    5,
    'Electrodomésticos',
    'Remington',
    '2200W Iónico',
    '7706006003',
    '/images/productos/secador-remington-ionico-morado.png',
    TRUE
  ),

  -- ==================== 7. COMPUTADORES & TABLETS (NUEVO) ====================
  (
    'Apple iPad 10ª Generación 10.9" Wi-Fi 64GB Azul',
    'Pantalla Liquid Retina de 10.9 pulgadas de borde a borde, chip A14 Bionic con CPU de 6 núcleos, cámara frontal horizontal de 12MP y compatibilidad con Apple Pencil.',
    1999900.00,
    20,
    4,
    'Computadores',
    'Apple',
    '10.9" 64GB Azul',
    '7702002002',
    '/images/productos/ipad-10-generacion-azul.png',
    TRUE
  ),

  -- ==================== 8. SMARTWATCHES & WEARABLES ====================
  (
    'Smartwatch Deportivo Bluetooth HD Pantalla Curva 2.0"',
    'Reloj inteligente con pantalla táctil HD de 2.0 pulgadas, monitoreo cardíaco y SpO2, más de 100 modos deportivos, llamadas Bluetooth con parlante y resistencia IP68.',
    249900.00,
    32,
    6,
    'Celulares',
    'TechFit',
    'Bisel Metálico 45mm',
    '7701001002',
    '/images/productos/smartwatch-deportivo-hd-negro.png',
    TRUE
  ),

  -- ==================== 9. AUDIO DE ALTA POTENCIA ====================
  (
    'Torre de Sonido LG XBOOM Bluetooth Fiesta & Luces LED',
    'Sistema de audio potente para el hogar y fiestas con Super Bass Boost, iluminación multicolor sincronizada con el ritmo, efectos DJ, función Karaoke Star y entrada para guitarra.',
    1299900.00,
    12,
    3,
    'Televisores',
    'LG',
    'Super Bass & Luces RGB',
    '7703003003',
    '/images/productos/torre-sonido-lg-xboom.png',
    TRUE
  ),

  -- ==================== 10. FITNESS & DEPORTES ====================
  (
    'Bicicleta Estática de Spinning Evolution Fitness Evo Flash',
    'Bicicleta de spinning profesional con volante de inercia cromado, resistencia magnética progresiva, asiento y manubrio ergonómicos ajustables y monitor digital de rendimiento.',
    1499900.00,
    10,
    2,
    'Deportes',
    'Evolution Fitness',
    'Evo Flash Pro',
    '7707007001',
    '/images/productos/bicicleta-spinning-evolution-flash.png',
    TRUE
  ),

  -- ==================== 11. SILLAS GAMER & CONFORT ====================
  (
    'Silla Gamer Primus Thrónos Ergonómica Azul y Negro',
    'Diseño ergonómico envolvente para largas jornadas de juego o trabajo, cojines lumbar y cervical desmontables, reposabrazos 2D, reclinación suave de hasta 135° y base de acero con ruedas dobles de 60mm.',
    849900.00,
    15,
    3,
    'Videojuegos',
    'Primus',
    'Reclinable 135°',
    '7704004002',
    '/images/productos/silla-gamer-primus-thronos-azul.png',
    TRUE
  );
