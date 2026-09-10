import Link from 'next/link';
import { Store, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-6xl mx-auto w-full text-zinc-900 antialiased">
      {/* Header editorial */}
      <div className="space-y-4 max-w-2xl pt-4 sm:pt-8">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Atelier / Sistema de Punto de Venta
        </p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 leading-[1.15]">
          Punto de venta unificado para tiendas y despachos virtuales.
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-xl">
          Terminal operativa para cajeros y administradores. Control riguroso de inventario,
          atención omnicanal y emisión de comprobantes en tiempo real.
        </p>
      </div>

      {/* Grid de Accesos Operativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
        {/* Terminal POS */}
        <Link
          href="/pos"
          className="group p-6 bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-900 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-5">
              <Store className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Operación
            </p>
            <h2 className="text-lg font-semibold text-zinc-950 mt-1">
              Terminal POS
            </h2>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Catálogo rápido, selector de canal físico/virtual, clientes y caja registradora.
            </p>
          </div>
          <div className="pt-6 flex items-center text-xs font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform">
            <span>Abrir terminal</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </Link>

        {/* Dashboard Admin */}
        <Link
          href="/admin"
          className="group p-6 bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-900 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center mb-5 border border-zinc-200/80">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Gestión
            </p>
            <h2 className="text-lg font-semibold text-zinc-950 mt-1">
              Panel Administrativo
            </h2>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Métricas de ventas por canal, control de turnos, cajas e inventario en almacén.
            </p>
          </div>
          <div className="pt-6 flex items-center text-xs font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform">
            <span>Ver métricas</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </Link>

        {/* Catálogo de Consulta */}
        <Link
          href="/catalogo"
          className="group p-6 bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-900 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center mb-5 border border-zinc-200/80">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Kiosco
            </p>
            <h2 className="text-lg font-semibold text-zinc-950 mt-1">
              Catálogo de Consulta
            </h2>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Consulta de disponibilidad de tallas, existencias y precios en mostrador.
            </p>
          </div>
          <div className="pt-6 flex items-center text-xs font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform">
            <span>Explorar prendas</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </Link>
      </div>

      {/* Footer minimalista */}
      <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 font-mono gap-2">
        <span>ATELIER POS HÍBRIDO — EDICIÓN RETAIL</span>
        <span>NEXT.JS APP ROUTER • TAILWIND CSS</span>
      </div>
    </div>
  );
}
