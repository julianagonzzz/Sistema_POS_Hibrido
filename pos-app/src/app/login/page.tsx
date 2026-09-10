'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Store, ShieldCheck, ShoppingBag, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { currentUser, switchUserById, allUsuarios, allVendedores } = useAuth();
  const router = useRouter();

  const handleSelectUser = (id: string, tipo: string) => {
    switchUserById(id);
    if (tipo === 'VENDEDOR') {
      router.push('/pos');
    } else if (tipo === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/catalogo');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFAFA] text-zinc-900">
      <div className="max-w-lg w-full bg-white border border-zinc-200/90 rounded-3xl p-8 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            Autenticación Demo
          </p>
          <h1 className="text-xl font-semibold text-zinc-950">
            Selección de Usuario Operativo
          </h1>
          <p className="text-xs text-zinc-500">
            Accede con un clic a los perfiles de prueba para alternar permisos de caja y administración.
          </p>
        </div>

        {/* Lista de Usuarios */}
        <div className="space-y-2.5 pt-2">
          {allUsuarios.map((usr) => {
            const isCurrent = currentUser.id === usr.id;
            const vendedor = allVendedores.find((v) => v.id_usuario === usr.id);

            let roleLabel = 'Cajero / Vendedor';
            if (usr.tipo_usuario === 'ADMIN') roleLabel = 'Administrador';
            if (usr.tipo_usuario === 'CLIENTE') roleLabel = 'Cliente / Kiosco';

            return (
              <div
                key={usr.id}
                onClick={() => handleSelectUser(usr.id, usr.tipo_usuario)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'border-zinc-900 bg-zinc-50/70 shadow-2xs'
                    : 'border-zinc-200/80 hover:border-zinc-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-medium ${
                      isCurrent
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'
                    }`}
                  >
                    {usr.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs text-zinc-950">{usr.nombre}</p>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        [{roleLabel}]
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      C.C. {usr.cedula}
                    </p>
                    {vendedor && (
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {vendedor.codigo_caja} • Turno {vendedor.turno.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-zinc-900 bg-zinc-200/60 px-2 py-0.5 rounded">
                      Activo
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
