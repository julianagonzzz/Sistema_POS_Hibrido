'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Vendedor, Administrador, TipoUsuario } from '@/lib/types';
import { INITIAL_USUARIOS, INITIAL_VENDEDORES, INITIAL_ADMINISTRADORES } from '@/lib/mock-data';

interface AuthContextType {
  currentUser: Usuario;
  currentVendedor: Vendedor | null;
  currentAdmin: Administrador | null;
  switchUserById: (userId: string) => void;
  switchRoleQuick: (tipo: TipoUsuario) => void;
  allUsuarios: Usuario[];
  allVendedores: Vendedor[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to first Vendedor (cajero) so the POS terminal works immediately
  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    return INITIAL_USUARIOS.find((u) => u.tipo_usuario === 'VENDEDOR') || INITIAL_USUARIOS[0];
  });

  const [currentVendedor, setCurrentVendedor] = useState<Vendedor | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Administrador | null>(null);

  useEffect(() => {
    if (currentUser.tipo_usuario === 'VENDEDOR') {
      const v = INITIAL_VENDEDORES.find((vend) => vend.id_usuario === currentUser.id) || INITIAL_VENDEDORES[0];
      setCurrentVendedor(v);
      setCurrentAdmin(null);
    } else if (currentUser.tipo_usuario === 'ADMIN') {
      const a = INITIAL_ADMINISTRADORES.find((adm) => adm.id_usuario === currentUser.id) || INITIAL_ADMINISTRADORES[0];
      setCurrentAdmin(a);
      setCurrentVendedor(null);
    } else {
      setCurrentVendedor(null);
      setCurrentAdmin(null);
    }
  }, [currentUser]);

  const switchUserById = (userId: string) => {
    const user = INITIAL_USUARIOS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const switchRoleQuick = (tipo: TipoUsuario) => {
    const match = INITIAL_USUARIOS.find((u) => u.tipo_usuario === tipo);
    if (match) {
      setCurrentUser(match);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentVendedor,
        currentAdmin,
        switchUserById,
        switchRoleQuick,
        allUsuarios: INITIAL_USUARIOS,
        allVendedores: INITIAL_VENDEDORES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
