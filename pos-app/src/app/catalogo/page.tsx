'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePos } from '@/context/PosContext';
import { Search, Store, X } from 'lucide-react';

export default function CatalogoPage() {
  const { productos } = usePos();
  const [search, setSearch] = useState('');
  const [genero, setGenero] = useState('TODOS');
  const [talla, setTalla] = useState('TODAS');

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

    const matchGen = genero === 'TODOS' || p.genero.toUpperCase() === genero.toUpperCase();
    const matchTalla = talla === 'TODAS' || p.talla.toUpperCase() === talla.toUpperCase();

    return matchSearch && matchGen && matchTalla;
  });

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-7 antialiased text-zinc-900">
      {/* Header editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Kiosco de Consulta en Tienda
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-1">
            Catálogo de Artículos & Disponibilidad
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Verifica tallas, precios y existencias en tiempo real de nuestra colección actual.
          </p>
        </div>

        <Link
          href="/pos"
          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition self-start md:self-auto shadow-2xs"
        >
          Ir a Terminal POS
        </Link>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar prenda o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/60 text-xs">
            {['TODOS', 'HOMBRE', 'MUJER', 'UNISEX'].map((g) => (
              <button
                key={g}
                onClick={() => setGenero(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                  genero === g
                    ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {g.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['TODAS', 'S', 'M', 'L', 'XL'].map((t) => (
              <button
                key={t}
                onClick={() => setTalla(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  talla === t
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productosFiltrados.map((prod) => {
          const isAgotado = prod.cantidad_stock === 0;

          return (
            <div
              key={prod.id_producto}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between shadow-2xs ${
                isAgotado
                  ? 'border-zinc-200/70 opacity-60 bg-zinc-50/40'
                  : 'border-zinc-200/80 hover:border-zinc-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase mb-2">
                  <span>{prod.genero}</span>
                  <span className="text-zinc-900 font-bold">Talla {prod.talla}</span>
                </div>

                <h3 className="font-medium text-zinc-950 text-sm leading-snug">{prod.nombre}</h3>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">{prod.id_producto}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Precio</span>
                  <span className="text-base font-semibold tracking-tight text-zinc-950">
                    {formatCOP(prod.precio)}
                  </span>
                </div>

                <div className="text-right">
                  {isAgotado ? (
                    <span className="text-[11px] font-mono text-zinc-400 line-through">
                      Agotado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {prod.cantidad_stock} disp.
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
