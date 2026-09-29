-- =====================================================================
-- 07_stock_minimo_y_reposicion.sql: US_13 - Gestión de inventario,
-- reposición y alertas de stock
-- =====================================================================

-- 1. Añadir columna stock_minimo a la tabla producto con valor por defecto 5
ALTER TABLE producto 
  ADD COLUMN IF NOT EXISTS stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0);

-- 2. Crear índice para optimizar consultas de alertas de inventario (agotados y críticos)
CREATE INDEX IF NOT EXISTS idx_producto_stock_alerta ON producto (activo, cantidad_stock, stock_minimo);

-- 3. Datos de prueba: configurar estados de inventario para validar alertas visuales y filtros
-- a) Producto Agotado (cantidad_stock = 0)
UPDATE producto 
SET cantidad_stock = 0 
WHERE codigo_barras = 'PROD-ELEC-004';

-- b) Producto en Stock Crítico con umbral estándar (cantidad_stock = 3 <= stock_minimo = 5)
UPDATE producto 
SET cantidad_stock = 3, stock_minimo = 5 
WHERE codigo_barras = 'PROD-MODA-004';

-- c) Producto en Stock Crítico con umbral personalizado (cantidad_stock = 6 <= stock_minimo = 10)
UPDATE producto 
SET cantidad_stock = 6, stock_minimo = 10 
WHERE codigo_barras = 'PROD-ELEC-003';
