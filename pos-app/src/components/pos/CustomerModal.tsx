'use client';

import React, { useState } from 'react';
import { usePos } from '@/context/PosContext';
import { Cliente } from '@/lib/types';
import { Search, X, Check, UserPlus, Phone, MapPin, CreditCard } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
  const { clientes, clienteActivo, setClienteActivo, registrarClienteRapido, canal } = usePos();
  const [activeTab, setActiveTab] = useState<'seleccionar' | 'crear'>('seleccionar');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula.includes(searchTerm) ||
      c.telefono.includes(searchTerm)
  );

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteActivo(cliente);
    onClose();
  };

  const handleCrearCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombre.trim()) {
      setErrorMsg('Cédula y Nombre completo son obligatorios');
      return;
    }

    const nuevo = registrarClienteRapido({
      cedula,
      nombre,
      telefono,
      direccion,
    });

    setClienteActivo(nuevo);
    setCedula('');
    setNombre('');
    setTelefono('');
    setDireccion('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Asignar Cliente</h2>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Canal: {canal.toLowerCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-800 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="p-3 bg-zinc-50 border-b border-zinc-100">
          <div className="flex bg-zinc-200/60 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('seleccionar')}
              className={`flex-1 py-1.5 rounded-md transition ${
                activeTab === 'seleccionar'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Buscar ({clientes.length})
            </button>
            <button
              onClick={() => setActiveTab('crear')}
              className={`flex-1 py-1.5 rounded-md transition ${
                activeTab === 'crear'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              + Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {activeTab === 'seleccionar' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por cédula, nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto rounded-xl border border-zinc-200/80">
                {clientesFiltrados.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400">
                    No se encontraron clientes registrados.
                  </div>
                ) : (
                  clientesFiltrados.map((c) => {
                    const isSelected = clienteActivo?.id_usuario === c.id_usuario;
                    return (
                      <div
                        key={c.id_usuario}
                        onClick={() => handleSelectCliente(c)}
                        className={`p-3 cursor-pointer transition flex items-center justify-between hover:bg-zinc-50 ${
                          isSelected ? 'bg-zinc-50 font-medium' : ''
                        }`}
                      >
                        <div>
                          <p className="font-medium text-zinc-900">{c.nombre}</p>
                          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            C.C. {c.cedula} • {c.telefono || 'Sin tel'}
                          </p>
                          {canal === 'VIRTUAL' && c.direccion && (
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Envío: {c.direccion}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-zinc-900 flex items-center gap-1 font-mono text-[10px]">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCrearCliente} className="space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg text-[11px] font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                  Cédula / Documento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1020304050"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Ramírez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="300 123 4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                    Dirección {canal === 'VIRTUAL' ? '(Envío)' : ''}
                  </label>
                  <input
                    type="text"
                    placeholder="Calle 10 # 20-30"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-medium rounded-xl transition text-xs shadow-xs"
                >
                  Registrar y Asociar al Ticket
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center text-[11px] text-zinc-500">
          <span>
            Seleccionado: <strong className="text-zinc-900">{clienteActivo.nombre}</strong>
          </span>
          <button
            onClick={() => {
              setClienteActivo(clientes[0]);
              onClose();
            }}
            className="text-zinc-600 hover:text-zinc-950 underline font-medium"
          >
            Cliente Mostrador
          </button>
        </div>
      </div>
    </div>
  );
}
