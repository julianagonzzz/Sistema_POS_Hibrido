-- =====================================================================
-- 04_ventas.sql: Tablas para US_03 (Asociación de punto de venta a cliente)
-- y US_04 (Registro de ventas y detalles de venta en caja)
-- =====================================================================

-- 1. Modificar tabla cliente para soportar US_03
ALTER TABLE cliente
  ADD COLUMN IF NOT EXISTS punto_venta VARCHAR(50),
  ADD COLUMN IF NOT EXISTS id_vendedor_registro INTEGER REFERENCES vendedor(id_usuario);

-- 2. Crear tabla principal de ventas (US_04)
CREATE TABLE IF NOT EXISTS venta (
  id_venta     SERIAL PRIMARY KEY,
  fecha        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  id_cliente   INTEGER REFERENCES usuario(id_usuario),
  id_vendedor  INTEGER REFERENCES vendedor(id_usuario),
  codigo_caja  VARCHAR(20) NOT NULL,
  medio_pago   VARCHAR(30) NOT NULL CHECK (medio_pago IN ('EFECTIVO', 'DATAFONO', 'NEQUI', 'TRANSFERENCIA')),
  canal        VARCHAR(20) NOT NULL DEFAULT 'FISICO',
  subtotal     DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  impuesto     DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (impuesto >= 0),
  total        DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  estado       VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA'
);

-- 3. Crear tabla de líneas/detalles de la venta (US_04)
CREATE TABLE IF NOT EXISTS detalle_venta (
  id_detalle      SERIAL PRIMARY KEY,
  id_venta        INTEGER NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
  id_producto     INTEGER NOT NULL REFERENCES producto(id_producto),
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(12, 2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Índices para optimizar búsquedas por cliente, vendedor y fecha
CREATE INDEX IF NOT EXISTS idx_venta_cliente ON venta(id_cliente);
CREATE INDEX IF NOT EXISTS idx_venta_vendedor ON venta(id_vendedor);
CREATE INDEX IF NOT EXISTS idx_venta_fecha ON venta(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta ON detalle_venta(id_venta);
