"use client";

// US_09 - Vista del carrito de compras (E-commerce)

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCarrito } from "./CarritoContext";
import { ProductImage } from "@/components/ProductImage";

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const INTERVALO_VALIDACION_MS = 30_000;

export default function CarritoPage() {
  const {
    items,
    total,
    cantidadTotal,
    cargado,
    alteraciones,
    validando,
    cambiarCantidad,
    remover,
    vaciar,
    validar,
    descartarAlteraciones,
  } = useCarrito();
  const [avisos, setAvisos] = useState<Record<number, string>>({});

  // Validar contra la BD al entrar, cada 30 s y al volver a la pestaña
  useEffect(() => {
    if (!cargado) return;
    validar();
    const intervalo = setInterval(validar, INTERVALO_VALIDACION_MS);
    const alVolver = () => document.visibilityState === "visible" && validar();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargado, validar]);

  function actualizar(id_producto: number, cantidad: number) {
    const r = cambiarCantidad(id_producto, cantidad);
    setAvisos((prev) => {
      const copia = { ...prev };
      if (r.ok) delete copia[id_producto];
      else if (r.mensaje) copia[id_producto] = r.mensaje;
      return copia;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/catalogo" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Seguir comprando
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/nexovolk-logo.png"
              alt="NexoVolk"
              className="w-8 h-8 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-slate-900">
              Nexo<span className="text-orange-500">Volk</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">🛒 Tu carrito</h1>
            <p className="text-sm text-slate-500">
              {cantidadTotal} {cantidadTotal === 1 ? "unidad" : "unidades"}
              {validando && " · verificando disponibilidad…"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={vaciar}
              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {/* Alerta por cambios externos en inventario/precios */}
        {alteraciones.length > 0 && (
          <div role="alert" className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <p className="font-bold text-sm">
                ⚠️ Pueden haber alteraciones en tu carrito de compra
              </p>
              <button
                onClick={descartarAlteraciones}
                className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer shrink-0"
              >
                Entendido
              </button>
            </div>
            <ul className="text-xs space-y-1 list-disc pl-5">
              {alteraciones.map((a) => (
                <li key={`${a.id_producto}-${a.tipo}`}>
                  <strong>{a.nombre}:</strong> {a.detalle}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!cargado ? (
          <p className="text-sm text-slate-500">Cargando carrito…</p>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <span className="text-4xl">🛍️</span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">Tu carrito está vacío</h2>
            <Link
              href="/catalogo"
              className="inline-block mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ítems */}
            <ul className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <li
                  key={item.id_producto}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs">
                    <ProductImage
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="w-full h-full object-contain"
                      fallbackEmoji="⚡"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase text-blue-600">{item.categoria}</p>
                    <p className="font-bold text-slate-900 truncate">{item.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {formatearPrecio(item.precio)} c/u · {item.stock_disponible} disponibles
                    </p>
                    {avisos[item.id_producto] && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">{avisos[item.id_producto]}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => actualizar(item.id_producto, item.cantidad - 1)}
                        className="w-8 h-8 hover:bg-slate-100 font-bold cursor-pointer"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.stock_disponible}
                        value={item.cantidad}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10);
                          if (!isNaN(n)) actualizar(item.id_producto, n);
                        }}
                        className="w-12 h-8 text-center text-sm font-semibold border-x border-slate-200 focus:outline-none"
                        aria-label={`Cantidad de ${item.nombre}`}
                      />
                      <button
                        onClick={() => actualizar(item.id_producto, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock_disponible}
                        className="w-8 h-8 hover:bg-slate-100 font-bold cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </p>
                    <button
                      onClick={() => remover(item.id_producto)}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumen */}
            <aside className="bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-3">
              <h2 className="font-bold text-slate-900">Resumen de compra</h2>
              {items.map((i) => (
                <div key={i.id_producto} className="flex justify-between text-xs text-slate-600">
                  <span className="truncate max-w-[60%]">
                    {i.cantidad}× {i.nombre}
                  </span>
                  <span>{formatearPrecio(i.precio * i.cantidad)}</span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-emerald-600">{formatearPrecio(total)}</span>
              </div>
              <p className="text-[11px] text-slate-400">Impuestos incluidos en el precio.</p>
              {/* El checkout (US_10) lo construye otra persona del equipo en /checkout */}
              <Link
                href="/checkout"
                className="block text-center w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
              >
                Proceder al pago
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}