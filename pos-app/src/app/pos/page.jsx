'use client';

import React, { useState, useMemo } from 'react';
import { usePos } from '@/context/PosContext';
import { useAuth } from '@/context/AuthContext';
import CustomerModal from '@/components/pos/CustomerModal';
import TicketReceiptModal from '@/components/pos/TicketReceiptModal';
import {
  Search,
  Store,
  Globe,
  Plus,
  Minus,
  Trash2,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  Check,
  AlertCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export default function PosTerminalPage() {
  const {
    productos,
    carrito,
    canal,
    clienteActivo,
    subtotal,
    impuesto,
    total,
    totalItems,
    setCanal,
    agregarAlCarrito,
    actualizarCantidadItem,
    eliminarDelCarrito,
    vaciarCarrito,
    finalizarVenta,
    getStockDisponible,
  } = usePos();

  const { currentUser, currentVendedor } = useAuth();

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('TODOS');
  const [tallaFiltro, setTallaFiltro] = useState('TODAS');

  // Estado del flujo de pago
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [notasVenta, setNotasVenta] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  // Modales
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Formato de moneda COP sobrio y elegante
  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Filtrado de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categoria && p.categoria.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.codigo_barras && p.codigo_barras.includes(searchQuery));

      const matchGenero =
        generoFiltro === 'TODOS' ||
        p.genero.toUpperCase() === generoFiltro.toUpperCase();

      const matchTalla =
        tallaFiltro === 'TODAS' ||
        p.talla.toUpperCase() === tallaFiltro.toUpperCase();

      return matchSearch && matchGenero && matchTalla;
    });
  }, [productos, searchQuery, generoFiltro, tallaFiltro]);

  const handleAgregar = (producto) => {
    setErrorFeedback('');
    const res = agregarAlCarrito(producto, 1);
    if (!res.success && res.error) {
      setErrorFeedback(res.error);
      setTimeout(() => setErrorFeedback(''), 4000);
    }
  };

  // Cálculo de vueltas para efectivo
  const pagoNum = parseFloat(montoRecibido) || 0;
  const cambio = medioPago === 'EFECTIVO' && pagoNum >= total ? pagoNum - total : 0;
  const pagoInsuficiente = medioPago === 'EFECTIVO' && pagoNum > 0 && pagoNum < total;

  const handleMontoRapido = (valor) => {
    setMontoRecibido(valor.toString());
  };

  const handleCobrar = () => {
    setErrorFeedback('');

    if (carrito.length === 0) {
      setErrorFeedback('Agrega al menos un artículo para procesar la orden.');
      return;
    }

    if (medioPago === 'EFECTIVO') {
      if (pagoNum < total) {
        setErrorFeedback(`El monto recibido es menor al total (${formatCOP(total)}).`);
        return;
      }
    }

    const res = finalizarVenta(
      medioPago,
      medioPago === 'EFECTIVO' ? pagoNum : total,
      notasVenta
    );

    if (res.success) {
      setMontoRecibido('');
      setNotasVenta('');
      setErrorFeedback('');
    } else if (res.error) {
      setErrorFeedback(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.75rem)] bg-[#FAFAFA] flex flex-col xl:flex-row text-zinc-900 antialiased">
      {/* ========================================================================= */}
      {/* PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS (Curaduría Minimalista)             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col p-5 lg:p-7 space-y-5 border-r border-zinc-200/80 overflow-y-auto">
        {/* Barra superior de control del catálogo */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 space-y-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Buscador minimalista */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por prenda, referencia o SKU..."
                className="w-full pl-10 pr-8 py-2 bg-zinc-50/60 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Segmented Control de Género */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/60 w-full sm:w-auto justify-center">
              {['TODOS', 'HOMBRE', 'MUJER', 'UNISEX'].map((gen) => (
                <button
                  key={gen}
                  onClick={() => setGeneroFiltro(gen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                    generoFiltro === gen
                      ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {gen.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Tallas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs border-t border-zinc-100">
            <span className="text-[11px] font-mono uppercase text-zinc-400 mr-2 shrink-0">
              Talla:
            </span>
            {['TODAS', 'XS', 'S', 'M', 'L', 'XL', '38', 'ÚNICA'].map((talla) => (
              <button
                key={talla}
                onClick={() => setTallaFiltro(talla)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                  tallaFiltro === talla
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                }`}
              >
                {talla}
              </button>
            ))}

            {(searchQuery || generoFiltro !== 'TODOS' || tallaFiltro !== 'TODAS') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGeneroFiltro('TODOS');
                  setTallaFiltro('TODAS');
                }}
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-800 transition font-medium shrink-0"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Feedback sutil de error si existe */}
        {errorFeedback && (
          <div className="bg-zinc-900 text-zinc-100 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorFeedback}</span>
            </div>
            <button onClick={() => setErrorFeedback('')} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Grid de Productos Minimalista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 flex-1">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-zinc-200">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mb-2 stroke-[1.2]" />
              <p className="text-sm font-medium text-zinc-800">No se encontraron artículos</p>
              <p className="text-xs text-zinc-400 max-w-xs mt-1">
                Prueba con otro término de búsqueda o restablece los filtros de género y talla.
              </p>
            </div>
          ) : (
            productosFiltrados.map((prod) => {
              const stockDisponible = getStockDisponible(prod.id_producto);
              const enCarritoItem = carrito.find(
                (item) => item.producto.id_producto === prod.id_producto
              );
              const enCarritoCount = enCarritoItem ? enCarritoItem.cantidad : 0;
              const isAgotado = prod.cantidad_stock === 0;
              const sinStockDisponible = stockDisponible === 0;

              return (
                <div
                  key={prod.id_producto}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between group relative ${
                    isAgotado
                      ? 'border-zinc-200/70 opacity-60 bg-zinc-50/40'
                      : sinStockDisponible
                      ? 'border-zinc-300 bg-zinc-50/50'
                      : 'border-zinc-200/80 hover:border-zinc-400 hover:shadow-sm'
                  }`}
                >
                  {/* Badge de cantidad activa en el ticket */}
                  {enCarritoCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-zinc-950 text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                      {enCarritoCount}
                    </span>
                  )}

                  <div>
                    {/* Metadatos superiores: Categoría, Género y Talla */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      <span>{prod.categoria || 'Prenda'}</span>
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        <span>{prod.genero}</span>
                        <span>•</span>
                        <span className="font-bold text-zinc-900">Talla {prod.talla}</span>
                      </div>
                    </div>

                    {/* Nombre del producto */}
                    <h3 className="font-medium text-zinc-900 text-sm leading-snug group-hover:text-zinc-950 transition">
                      {prod.nombre}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-400 mt-1">
                      {prod.id_producto}
                    </p>
                  </div>

                  {/* Stock y Precio */}
                  <div className="pt-4 mt-2 border-t border-zinc-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Precio</p>
                      <p className="text-base font-semibold tracking-tight text-zinc-950">
                        {formatCOP(prod.precio)}
                      </p>
                    </div>

                    {/* Indicador de Stock sobrio */}
                    <div className="text-right">
                      {isAgotado ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 line-through">
                          Agotado
                        </span>
                      ) : sinStockDisponible ? (
                        <span className="text-[11px] font-medium text-zinc-600">
                          En ticket
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              stockDisponible <= 3 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                          />
                          {stockDisponible === 1
                            ? 'Última pieza'
                            : `${stockDisponible} disponibles`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de adición minimalista */}
                  <button
                    onClick={() => handleAgregar(prod)}
                    disabled={isAgotado || sinStockDisponible}
                    className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                      isAgotado || sinStockDisponible
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {sinStockDisponible ? 'Stock en ticket' : 'Agregar'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL DERECHO: TERMINAL DE TICKET & COBRO (Estilo Hardware POS Profesional) */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-[440px] 2xl:w-[480px] bg-white border-l border-zinc-200/90 flex flex-col h-auto xl:h-[calc(100vh-3.75rem)] shadow-xs">
        {/* Cabecera: Selector de Canal Minimalista [FÍSICO / VIRTUAL] */}
        <div className="p-4 border-b border-zinc-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] uppercase font-mono tracking-wider text-zinc-400">
              Canal de Venta
            </span>
            <span className="font-mono text-zinc-500 text-[11px]">
              {currentVendedor?.codigo_caja || 'POS-01'}
            </span>
          </div>

          {/* Segmented control Físico / Virtual */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
            <button
              onClick={() => setCanal('FISICO')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                canal === 'FISICO'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Tienda Física</span>
            </button>
            <button
              onClick={() => setCanal('VIRTUAL')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                canal === 'VIRTUAL'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Venta Virtual</span>
            </button>
          </div>
        </div>

        {/* Fila de Cliente Activo */}
        <div className="px-4 py-3 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-xs font-medium shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-xs">
              <p className="font-medium text-zinc-900 truncate">
                {clienteActivo.nombre}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 truncate">
                C.C. {clienteActivo.cedula}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 underline underline-offset-2 transition shrink-0 ml-2"
          >
            Cambiar
          </button>
        </div>

        {/* Lista de Artículos en el Ticket */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-100">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ShoppingBag className="w-8 h-8 stroke-[1.2] text-zinc-300 mb-2" />
              <p className="text-xs font-medium text-zinc-600">Ticket en blanco</p>
              <p className="text-[11px] text-zinc-400 max-w-[180px] mt-0.5">
                Selecciona prendas del catálogo para iniciar la venta.
              </p>
            </div>
          ) : (
            carrito.map((item) => {
              const prod = item.producto;
              const stockDisponible = getStockDisponible(prod.id_producto);
              const puedeSumar = stockDisponible > 0;

              return (
                <div key={prod.id_producto} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 truncate">
                      {prod.nombre}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>Talla {prod.talla}</span>
                      <span>•</span>
                      <span>{formatCOP(prod.precio)}</span>
                    </div>
                  </div>

                  {/* Stepper de Cantidad */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        actualizarCantidadItem(prod.id_producto, item.cantidad - 1)
                      }
                      className="w-6 h-6 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-semibold text-xs text-zinc-900">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        actualizarCantidadItem(prod.id_producto, item.cantidad + 1)
                      }
                      disabled={!puedeSumar}
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition text-xs ${
                        puedeSumar
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                          : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal del Item y Eliminar */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="text-xs font-semibold text-zinc-950">
                      {formatCOP(item.subtotal)}
                    </p>
                    <button
                      onClick={() => eliminarDelCarrito(prod.id_producto)}
                      className="text-zinc-300 hover:text-zinc-600 p-0.5 transition mt-0.5"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen Financiero y Métodos de Cobro */}
        <div className="p-4 bg-zinc-50/70 border-t border-zinc-200/80 space-y-3.5">
          {/* Desglose */}
          <div className="space-y-1.5 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} piezas):</span>
              <span className="font-mono text-zinc-700">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19% discriminado):</span>
              <span className="font-mono text-zinc-700">{formatCOP(impuesto)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-zinc-950 pt-2 border-t border-zinc-200/80">
              <span>Total a pagar:</span>
              <span className="font-mono text-lg font-bold">{formatCOP(total)}</span>
            </div>
          </div>

          {/* Medios de Pago */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Método de Pago:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
                { id: 'DATAFONO', label: 'Tarjeta', icon: CreditCard },
                { id: 'NEQUI', label: 'Nequi', icon: Smartphone },
                { id: 'TRANSFERENCIA', label: 'Transf.', icon: ArrowRightLeft },
              ].map((mp) => {
                const Icon = mp.icon;
                const isSelected = medioPago === mp.id;
                return (
                  <button
                    key={mp.id}
                    onClick={() => {
                      setMedioPago(mp.id);
                      if (mp.id !== 'EFECTIVO') setMontoRecibido('');
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-medium flex flex-col items-center gap-1 border transition ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-semibold'
                        : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-100/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detalle si es Efectivo: Recibido y Cambio */}
          {medioPago === 'EFECTIVO' && total > 0 && (
            <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Recibido:</span>
                <div className="relative w-36">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder={total.toString()}
                    className="w-full pl-6 pr-2 py-1 text-right font-mono font-medium border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Botones de sugerencia */}
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => handleMontoRapido(total)}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-mono"
                >
                  Exacto
                </button>
                <button
                  onClick={() => handleMontoRapido(Math.ceil(total / 50000) * 50000 || 50000)}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-mono"
                >
                  {formatCOP(Math.ceil(total / 50000) * 50000 || 50000)}
                </button>
                <button
                  onClick={() => handleMontoRapido(100000)}
                  className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-mono"
                >
                  $100.000
                </button>
              </div>

              {pagoInsuficiente && (
                <p className="text-[11px] text-zinc-600 font-medium pt-1">
                  Monto restante: {formatCOP(total - pagoNum)}
                </p>
              )}
              {pagoNum >= total && (
                <div className="flex justify-between items-center pt-1 border-t border-zinc-100 text-zinc-900 font-medium">
                  <span>Cambio / Vueltas:</span>
                  <span className="font-mono text-sm font-semibold">{formatCOP(cambio)}</span>
                </div>
              )}
            </div>
          )}

          {/* Notas para venta virtual */}
          {canal === 'VIRTUAL' && (
            <input
              type="text"
              value={notasVenta}
              onChange={(e) => setNotasVenta(e.target.value)}
              placeholder="Número de guía o nota de despacho..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          )}

          {/* Botones de Cobro y Vaciar */}
          <div className="flex gap-2 pt-1">
            {carrito.length > 0 && (
              <button
                onClick={vaciarCarrito}
                className="px-3 py-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-100/60 rounded-xl transition"
                title="Limpiar ticket"
              >
                Vaciar
              </button>
            )}

            <button
              onClick={handleCobrar}
              disabled={carrito.length === 0 || pagoInsuficiente}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-xs tracking-wide transition flex items-center justify-center gap-2 ${
                carrito.length === 0 || pagoInsuficiente
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white active:scale-[0.99] shadow-xs'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Cobrar {formatCOP(total)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <TicketReceiptModal />
    </div>
  );
}
