import Link from "next/link";
import { listarProductos, listarCategorias, Producto } from "@/lib/productos";
import CatalogoCliente from "./CatalogoCliente";
import { BotonCarrito } from "@/app/carrito/CarritoContext";

export default async function CatalogoPage() {
  let productos: Producto[] = [];
  let categorias: string[] = [];
  let errorCarga: string | null = null;

  try {
    const [prods, cats] = await Promise.all([
      listarProductos(),
      listarCategorias(),
    ]);
    productos = prods;
    categorias = cats;
  } catch (error) {
    console.error("Error al cargar productos del catálogo:", error);
    errorCarga = "No se pudieron obtener los productos de la base de datos.";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Barra de navegación */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-indigo-700 transition-colors">
              H
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Híbrido<span className="text-indigo-600">POS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Catálogo
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <BotonCarrito />
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ← Inicio
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Título y estado */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Base de Datos PostgreSQL Conectada
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Catálogo General de Productos
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Explora electrodomésticos, aseo personal, alimentos, moda y más con disponibilidad en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal: Catálogo interactivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {errorCarga ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center max-w-lg mx-auto">
            <p className="font-semibold">⚠️ {errorCarga}</p>
            <p className="text-xs text-rose-600 mt-1">
              Verifica la conexión a PostgreSQL y que la tabla producto esté creada.
            </p>
          </div>
        ) : (
          <CatalogoCliente productosIniciales={productos} categorias={categorias} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">Sistema POS Híbrido</p>
        </div>
      </footer>
    </div>
  );
}
