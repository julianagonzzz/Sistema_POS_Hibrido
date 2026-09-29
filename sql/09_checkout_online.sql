-- =====================================================================
-- 09_checkout_online.sql: US_10 - Proceso de checkout y confirmación
-- de pedido online.
-- Agrega campos de envío a cliente y venta, y expande los medios de pago
-- permitidos para ventas virtuales (TARJETA_CREDITO, PSE, TRANSFERENCIA).
-- Es idempotente: se puede ejecutar varias veces sin errores.
-- =====================================================================

-- 1. Agregar campo ciudad a la tabla cliente para precargar datos de envío
ALTER TABLE cliente
  ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);

-- 2. Agregar datos de envío a la tabla venta para auditoría del pedido online
ALTER TABLE venta
  ADD COLUMN IF NOT EXISTS direccion_envio  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ciudad_envio     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS telefono_envio   VARCHAR(30);

-- 3. Actualizar la restricción de medios de pago para soportar pasarelas online
-- (TARJETA_CREDITO, PSE, TRANSFERENCIA) además de los medios POS (EFECTIVO, DATAFONO, NEQUI).
ALTER TABLE venta DROP CONSTRAINT IF EXISTS venta_medio_pago_check;
ALTER TABLE venta ADD CONSTRAINT venta_medio_pago_check
  CHECK (medio_pago IN ('EFECTIVO', 'DATAFONO', 'NEQUI', 'TRANSFERENCIA', 'TARJETA_CREDITO', 'PSE'));

-- 4. Asegurar índice para consultas de ventas por cliente y canal
CREATE INDEX IF NOT EXISTS idx_venta_cliente_canal ON venta (id_cliente, canal, fecha DESC);
