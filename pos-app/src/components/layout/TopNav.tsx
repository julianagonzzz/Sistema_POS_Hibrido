'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TipoUsuario } from '@/lib/types';
import {
  Store,
  LayoutDashboard,
  ShoppingBag,
  Clock,
  LogIn,
  ChevronDown,
} from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();
  const { currentUser, currentVendedor, switchRoleQuick, switchUserById, allUsuarios } = useAuth();

  const navLinks = [
    { href: '/pos', label: 'Terminal POS' },
    { href: '/admin', label: 'Administración' },
    { href: '/catalogo', label: 'Catálogo' },
  ];

  return (
    <header className="bg-white border-b border-zinc-200/90 text-zinc-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/pos" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white transition group-hover:bg-zinc-800">
                <Store className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-zinc-950">
                  ATELIER <span className="font-normal text-zinc-400">/ POS</span>
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Demo Role Switcher & Context Info */}
          <div className="flex items-center gap-3">
            {/* Cashier / Box metadata if Vendedor */}
            {currentUser.tipo_usuario === 'VENDEDOR' && currentVendedor && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium text-zinc-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {currentVendedor.codigo_caja}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500 text-[11px]">
                  Turno {currentVendedor.turno.toLowerCase()}
                </span>
              </div>
            )}

            {/* Minimalist Segmented Role Switcher */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60 text-xs">
              <span className="text-[10px] text-zinc-400 px-2 font-mono uppercase hidden sm:inline">
                Rol:
              </span>
              {(['VENDEDOR', 'ADMIN', 'CLIENTE'] as TipoUsuario[]).map((rol) => {
                const isSelected = currentUser.tipo_usuario === rol;
                const labels: Record<TipoUsuario, string> = {
                  VENDEDOR: 'Cajero',
                  ADMIN: 'Admin',
                  CLIENTE: 'Cliente',
                };

                return (
                  <button
                    key={rol}
                    onClick={() => switchRoleQuick(rol)}
                    className={`px-2.5 py-1 rounded-md text-xs transition font-medium ${
                      isSelected
                        ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {labels[rol]}
                  </button>
                );
              })}
            </div>

            {/* Current user badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[11px] font-medium">
                {currentUser.nombre.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <p className="font-medium text-zinc-900">{currentUser.nombre.split(' ')[0]}</p>
                <p className="text-[10px] text-zinc-400 capitalize mt-0.5">
                  {currentUser.tipo_usuario.toLowerCase()}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition"
              title="Cambiar usuario"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
