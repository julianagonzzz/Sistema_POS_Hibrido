'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { PosProvider } from '@/context/PosContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PosProvider>{children}</PosProvider>
    </AuthProvider>
  );
}
