'use client';

import React from 'react';
import { usePos } from '@/context/PosContext';
import { Printer, Check, X, ShoppingBag } from 'lucide-react';

export default function TicketReceiptModal() {
  const { ticketActivo, setTicketActivo } = usePos();

  if (!ticketActivo) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setTicketActivo(null);
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header sobrio de confirmación */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-medium text-zinc-900">
              Venta completada — #{ticketActivo.id_venta}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tirilla de papel térmico (80mm) con diseño editorial tipográfico */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-100/60 flex justify-center">
          <div
            id="thermal-receipt"
            className="w-full bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs font-mono text-xs text-zinc-800 leading-relaxed"
          >
            {/* Encabezado Comercio */}
            <div className="text-center pb-3 border-b border-dashed border-zinc-300">
              <p className="font-semibold text-xs tracking-widest uppercase text-zinc-950">
                ATELIER STUDIO
              </p>
              <p className="text-[10px] text-zinc-400">NIT: 901.234.567-8</p>
              <p className="text-[10px] text-zinc-400">Medellín, Colombia</p>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                [{ticketActivo.canal === 'FISICO' ? 'Venta Tienda' : 'Venta Virtual'}]
              </div>
            </div>

            {/* Metadatos */}
            <div className="py-2.5 border-b border-dashed border-zinc-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Factura:</span>
                <span className="font-bold text-zinc-900">{ticketActivo.id_venta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Fecha:</span>
                <span>{ticketActivo.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Terminal:</span>
                <span>{ticketActivo.codigo_caja}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Atendido por:</span>
                <span>{ticketActivo.vendedor_nombre}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dotted border-zinc-200">
                <span className="text-zinc-400">Cliente:</span>
                <span className="font-medium text-zinc-900">{ticketActivo.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Documento:</span>
                <span>{ticketActivo.cliente_cedula}</span>
              </div>
              {ticketActivo.notas && (
                <div className="pt-1 text-[9px] text-zinc-500 italic">
                  Nota: {ticketActivo.notas}
                </div>
              )}
            </div>

            {/* Artículos */}
            <div className="py-3 border-b border-dashed border-zinc-300">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Cant | Descripción</span>
                <span>Subtotal</span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                {ticketActivo.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-medium">
                      <span className="truncate pr-2">
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span className="shrink-0">{formatCOP(item.subtotal)}</span>
                    </div>
                    <div className="text-[9px] text-zinc-400 pl-3">
                      Talla {item.talla} • {formatCOP(item.precio_unitario)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales y Medio de Pago */}
            <div className="py-2.5 border-b border-dashed border-zinc-300 space-y-1 text-[10px]">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal (sin IVA):</span>
                <span>{formatCOP(ticketActivo.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>IVA (19%):</span>
                <span>{formatCOP(ticketActivo.impuesto)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1.5 border-t border-zinc-200">
                <span>TOTAL:</span>
                <span>{formatCOP(ticketActivo.total)}</span>
              </div>
              <div className="pt-1.5 flex justify-between text-zinc-700">
                <span>Método:</span>
                <span className="font-semibold uppercase">{ticketActivo.medio_pago}</span>
              </div>
              {ticketActivo.medio_pago === 'EFECTIVO' && ticketActivo.pago_recibido && (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>Recibido:</span>
                    <span>{formatCOP(ticketActivo.pago_recibido)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900">
                    <span>Cambio / Vueltas:</span>
                    <span>{formatCOP(ticketActivo.cambio || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode minimalista */}
            <div className="pt-3 text-center text-[9px] text-zinc-400 space-y-1">
              <p>Gracias por su visita</p>
              <div className="pt-1 flex justify-center">
                <div className="h-6 flex items-center justify-center gap-[1px] px-2">
                  {[3, 2, 5, 2, 1, 4, 2, 3, 5, 1, 4, 2, 3, 5, 2, 3, 1, 4, 2].map((h, i) => (
                    <div
                      key={i}
                      className="bg-zinc-800 w-[1.5px]"
                      style={{ height: `${h * 3}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="font-mono text-[8px] tracking-widest">
                *{ticketActivo.id_venta}*
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-3 bg-white border-t border-zinc-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-white hover:bg-zinc-50 text-zinc-800 font-medium rounded-xl transition flex items-center justify-center gap-1.5 text-xs border border-zinc-200"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
