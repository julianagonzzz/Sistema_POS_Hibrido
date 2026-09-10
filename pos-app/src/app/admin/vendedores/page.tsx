'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePos } from '@/context/PosContext';
import { ArrowLeft, Clock } from 'lucide-react';

export default function AdminVendedoresPage() {
  const { allUsuarios, allVendedores, switchUserById, currentUser } = useAuth();
  const { ventas } = usePos();

  const vendedoresCompletos = allVendedores.map((v) => {
    const usr = allUsuarios.find((u) => u.id === v.id_usuario);
    const ventasCajero = ventas.filter((vt) => vt.id_vendedor === v.id_usuario);
    const totalFacturado = ventasCajero.reduce((acc, vt) => acc + vt.total, 0);

    return {
      ...v,
      usuario: usr,
      ventasCount: ventasCajero.length,
      totalFacturado,
    };
  });

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 antialiased text-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-800 transition mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a métricas
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-950">Asignación de Cajeros & Terminales</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Códigos de caja física, turnos laborales y facturación acumulada por puesto operativo.
        </p>
      </div>

      {/* Cards de Vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendedoresCompletos.map((vend) => {
          const isCurrentActive = currentUser.id === vend.id_usuario;

          return (
            <div
              key={vend.id_usuario}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                isCurrentActive
                  ? 'border-zinc-950 shadow-xs'
                  : 'border-zinc-200/80 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono font-medium text-xs text-zinc-800">
                    {vend.usuario?.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-950 text-sm">{vend.usuario?.nombre}</h3>
                    <p className="text-xs text-zinc-400 font-mono">C.C. {vend.usuario?.cedula}</p>
                    <p className="text-xs text-zinc-400 font-mono">{vend.usuario?.correo}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-mono text-xs font-medium rounded-lg border border-zinc-200/80">
                  {vend.codigo_caja}
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Turno</span>
                  <span className="font-medium text-zinc-800 mt-0.5 block">
                    {vend.turno.toLowerCase()}
                  </span>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Tickets</span>
                  <span className="font-medium text-zinc-800 mt-0.5 block font-mono">
                    {vend.ventasCount}
                  </span>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Facturado</span>
                  <span className="font-semibold text-zinc-900 mt-0.5 block font-mono truncate">
                    {formatCOP(vend.totalFacturado)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between">
                <button
                  onClick={() => switchUserById(vend.id_usuario)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-medium transition ${
                    isCurrentActive
                      ? 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  }`}
                >
                  {isCurrentActive ? 'Cajero activo' : 'Operar POS con este cajero'}
                </button>

                <Link
                  href="/pos"
                  className="text-xs text-zinc-500 font-medium hover:text-zinc-950 underline"
                >
                  Ir al terminal →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
