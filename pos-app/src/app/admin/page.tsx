'use client';

import React from 'react';
import Link from 'next/link';
import { usePos } from '@/context/PosContext';
import { useAuth } from '@/context/AuthContext';
import {
  Store,
  Globe,
  DollarSign,
  Package,
  Users,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { ventas, productos } = usePos();
  const { currentAdmin } = useAuth();

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalVendido = ventas.reduce((acc, v) => acc + v.total, 0);
  const ventasFisicas = ventas.filter((v) => v.canal === 'FISICO');
  const ventasVirtuales = ventas.filter((v) => v.canal === 'VIRTUAL');

  const totalFisico = ventasFisicas.reduce((acc, v) => acc + v.total, 0);
  const totalVirtual = ventasVirtuales.reduce((acc, v) => acc + v.total, 0);

  const porcentajeFisico = totalVendido > 0 ? Math.round((totalFisico / totalVendido) * 100) : 0;
  const porcentajeVirtual = totalVendido > 0 ? Math.round((totalVirtual / totalVendido) * 100) : 0;

  const stockTotal = productos.reduce((acc, p) => acc + p.cantidad_stock, 0);
  const productosBajoStock = productos.filter((p) => p.cantidad_stock <= 3 && p.cantidad_stock > 0);
  const productosAgotados = productos.filter((p) => p.cantidad_stock === 0);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7 antialiased text-zinc-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Administración Central
          </p>
          <h1 className="text-2xl font-semibold text-zinc-950 mt-1">
            Métricas de Venta Omnicanal
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Desempeño financiero comparado entre compras físicas en mostrador y despachos virtuales.
          </p>
        </div>

        {/* Accesos directos */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/vendedores"
            className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200/90 text-zinc-800 hover:bg-zinc-50 text-xs font-medium transition"
          >
            Cajeros & Turnos
          </Link>
          <Link
            href="/admin/productos"
            className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200/90 text-zinc-800 hover:bg-zinc-50 text-xs font-medium transition"
          >
            Inventario & Stock
          </Link>
          <Link
            href="/pos"
            className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition"
          >
            Abrir POS
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Facturación Total
          </span>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 mt-2">
            {formatCOP(totalVendido)}
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 font-mono">
            {ventas.length} transacciones
          </p>
        </div>

        {/* Ventas Físicas */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Canal Físico
            </span>
            <Store className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 mt-2">
            {formatCOP(totalFisico)}
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 font-mono">
            {ventasFisicas.length} tickets • {porcentajeFisico}% total
          </p>
        </div>

        {/* Ventas Virtuales */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Canal Virtual
            </span>
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 mt-2">
            {formatCOP(totalVirtual)}
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 font-mono">
            {ventasVirtuales.length} pedidos • {porcentajeVirtual}% total
          </p>
        </div>

        {/* Stock Total */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Inventario en Almacén
            </span>
            <Package className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 mt-2">
            {stockTotal} <span className="text-sm font-normal text-zinc-400">un.</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 font-mono">
            {productosBajoStock.length} crítico • {productosAgotados.length} agotados
          </p>
        </div>
      </div>

      {/* Distribución de Facturación */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-semibold text-zinc-950">Participación por Canal</h3>
          <span className="font-mono text-zinc-400">100% Auditado</span>
        </div>

        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${porcentajeFisico}%` }}
            className="bg-zinc-900 h-full transition-all duration-500"
            title={`Físico: ${porcentajeFisico}%`}
          />
          <div
            style={{ width: `${porcentajeVirtual}%` }}
            className="bg-zinc-400 h-full transition-all duration-500"
            title={`Virtual: ${porcentajeVirtual}%`}
          />
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-500 pt-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block" />
            <span>Tienda Física: {porcentajeFisico}% ({formatCOP(totalFisico)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
            <span>Ventas Virtuales: {porcentajeVirtual}% ({formatCOP(totalVirtual)})</span>
          </div>
        </div>
      </div>

      {/* Historial Reciente */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs text-zinc-950">
              Registro de Facturas
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">Últimas transacciones procesadas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50/70 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-100">
              <tr>
                <th className="py-3 px-4">Factura</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Cajero / Caja</th>
                <th className="py-3 px-4">Medio Pago</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {ventas.map((v) => (
                <tr key={v.id_venta} className="hover:bg-zinc-50/60 transition">
                  <td className="py-3 px-4 font-mono font-medium text-zinc-950">
                    {v.id_venta}
                    <span className="block text-[10px] text-zinc-400 font-normal">{v.fecha}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {v.canal}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-zinc-900">{v.cliente_nombre}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">C.C. {v.cliente_cedula}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-zinc-800">{v.vendedor_nombre}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{v.codigo_caja}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] uppercase text-zinc-600">
                    {v.medio_pago}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-zinc-600">
                    {v.items.reduce((acc, it) => acc + it.cantidad, 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-zinc-950">
                    {formatCOP(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
