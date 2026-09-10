'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePos } from '@/context/PosContext';
import { ArrowLeft, Search } from 'lucide-react';

export default function AdminProductosPage() {
  const { productos } = usePos();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'AGOTADO' | 'BAJO'>('TODOS');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const productosFiltrados = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.id_producto.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(search.toLowerCase()));

    if (filtroEstado === 'AGOTADO') return matchSearch && p.cantidad_stock === 0;
    if (filtroEstado === 'BAJO') return matchSearch && p.cantidad_stock > 0 && p.cantidad_stock <= 3;
    return matchSearch;
  });

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 antialiased text-zinc-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-800 transition mb-3 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a métricas
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-950">Inventario Central</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitoreo en tiempo real de unidades físicas y alerta de reposición.
          </p>
        </div>

        <Link
          href="/pos"
          className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition self-start sm:self-auto"
        >
          Probar en Terminal POS
        </Link>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-zinc-50/60 focus:bg-white"
          />
        </div>

        <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/60 w-full sm:w-auto text-xs">
          <button
            onClick={() => setFiltroEstado('TODOS')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition ${
              filtroEstado === 'TODOS'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Todos ({productos.length})
          </button>
          <button
            onClick={() => setFiltroEstado('BAJO')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition ${
              filtroEstado === 'BAJO'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Stock Crítico (≤ 3)
          </button>
          <button
            onClick={() => setFiltroEstado('AGOTADO')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition ${
              filtroEstado === 'AGOTADO'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50/70 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-100">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Género</th>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Precio</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {productosFiltrados.map((p) => {
                const isAgotado = p.cantidad_stock === 0;
                const isCritico = p.cantidad_stock > 0 && p.cantidad_stock <= 3;

                return (
                  <tr key={p.id_producto} className="hover:bg-zinc-50/60 transition">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                      {p.id_producto}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900">{p.nombre}</td>
                    <td className="py-3 px-4 text-zinc-500">{p.genero}</td>
                    <td className="py-3 px-4 font-mono text-zinc-800">{p.talla}</td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{p.categoria}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950">
                      {formatCOP(p.precio)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {p.cantidad_stock}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">
                      {isAgotado ? (
                        <span className="text-zinc-400 line-through">Agotado</span>
                      ) : isCritico ? (
                        <span className="text-amber-700 font-medium">Bajo stock</span>
                      ) : (
                        <span className="text-zinc-600">Disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
