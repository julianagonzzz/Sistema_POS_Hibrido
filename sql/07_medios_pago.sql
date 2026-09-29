-- =====================================================================
-- 07_medios_pago.sql: US_14 - Gestión de múltiples medios de pago y
-- cálculo de cambio en el POS.
-- Agrega a la tabla venta el desglose del pago: monto recibido, cambio
-- entregado y referencia de la transacción electrónica (opcional).
-- Es idempotente: se puede ejecutar varias veces sin romper nada.
-- =====================================================================

-- DECIMAL(12,2): mismo tipo que total/subtotal para comparar valores exactos (sin errores de FLOAT).
-- monto_recibido y referencia_pago admiten NULL para no romper las ventas ONLINE (US_10).
ALTER TABLE venta
  ADD COLUMN IF NOT EXISTS monto_recibido  DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS cambio          DECIMAL(12, 2) NOT NULL DEFAULT 0,  -- 0 en pagos electrónicos
  ADD COLUMN IF NOT EXISTS referencia_pago VARCHAR(60);                        -- código de aprobación (opcional)

-- Las ventas antiguas (Sprint 1) no tenían monto recibido: se asume pago exacto
UPDATE venta SET monto_recibido = total WHERE monto_recibido IS NULL;

-- Reglas de integridad: la BD rechaza pagos incoherentes aunque se inserten desde otro lugar.
-- Postgres no tiene "ADD CONSTRAINT IF NOT EXISTS", por eso se hace DROP + ADD.
ALTER TABLE venta DROP CONSTRAINT IF EXISTS chk_venta_monto_recibido;
ALTER TABLE venta ADD CONSTRAINT chk_venta_monto_recibido
  CHECK (monto_recibido IS NULL OR monto_recibido >= total);  -- no se acepta efectivo insuficiente

ALTER TABLE venta DROP CONSTRAINT IF EXISTS chk_venta_cambio;
ALTER TABLE venta ADD CONSTRAINT chk_venta_cambio CHECK (cambio >= 0);