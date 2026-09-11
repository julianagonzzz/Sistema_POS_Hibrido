import Link from "next/link";
import { listarProductosDestacados, Producto } from "@/lib/productos";

function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const CATEGORIAS_DESTACADAS = [
  { nombre: "Electrodomésticos", icono: "🍳", desc: "Freidoras, cafeteras, licuadoras" },
  { nombre: "Aseo Personal", icono: "🧴", desc: "Cuidado capilar, dental y piel" },
  { nombre: "Alimentos", icono: "☕", desc: "Café de origen, aceites y granos" },
  { nombre: "Moda", icono: "👔", desc: "Prendas formales, urbanas y calzado" },
];

export default async function HomePage() {
  let productosDestacados: Producto[] = [];
  try {
    productosDestacados = await listarProductosDestacados(4);
  } catch (error) {
    console.error("Error al cargar productos destacados:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Marca */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-indigo-700 transition-colors">
              H
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Híbrido<span className="text-indigo-600">POS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Store
              </span>
            </div>
          </Link>

          {/* Botones a la derecha */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span>Catálogo</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                Multicategoría
              </span>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 py-16 sm:py-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mb-4">
              ✨ Tienda Omnicanal • Electrodomésticos, Alimentos, Aseo y Moda
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Todo lo que necesitas en un solo lugar
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Explora nuestro catálogo con inventario en tiempo real conectado directamente a la base de datos.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/catalogo"
                className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-3"
              >
                <span>Explorar Catálogo Completo</span>
                <span className="text-xl font-bold">→</span>
              </Link>
            </div>
          </div>

          {/* Categorías Principales */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {CATEGORIAS_DESTACADAS.map((cat) => (
              <Link
                key={cat.nombre}
                href="/catalogo"
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icono}
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {cat.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Muestra Destacada por Categoría */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h2 className="text-2xl font-bold text-slate-900">
                Muestra Destacada por Categoría
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Un producto de cada línea principal consultado en tiempo real desde PostgreSQL.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 hover:underline"
          >
            Ver todos los productos en el catálogo →
          </Link>
        </div>

        {/* Rejilla de productos destacados */}
        {productosDestacados.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No hay productos registrados en la base de datos actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map((prod) => (
              <div
                key={prod.id_producto}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Contenedor de Imagen o Icono */}
                <div className="h-48 bg-slate-100 flex items-center justify-center text-6xl relative select-none">
                  {prod.imagen_url || "🏷️"}
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      prod.cantidad_stock > 0
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-rose-100 text-rose-800 border-rose-200"
                    }`}
                  >
                    {prod.cantidad_stock > 0 ? `Stock: ${prod.cantidad_stock}` : "Agotado"}
                  </span>
                  {prod.talla && prod.talla !== "Única" && (
                    <span className="absolute bottom-3 left-3 text-xs font-medium px-2 py-0.5 bg-white/90 text-slate-600 rounded-md backdrop-blur-xs">
                      {prod.talla}
                    </span>
                  )}
                </div>

                {/* Contenido del producto */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {prod.categoria}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-1 line-clamp-1">
                    {prod.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 flex-1 leading-relaxed">
                    {prod.descripcion}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Precio
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatearPrecio(prod.precio)}
                      </span>
                    </div>

                    <Link
                      href="/catalogo"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner CTA Catálogo */}
        <div className="mt-14 rounded-2xl bg-indigo-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-bold">Variedad total para tu hogar y estilo</h3>
            <p className="text-indigo-200 text-sm max-w-xl">
              Electrodomésticos, despensa de alimentos, cuidado personal y las últimas tendencias de moda.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="whitespace-nowrap px-6 py-3 bg-white text-indigo-950 font-bold rounded-xl hover:bg-indigo-50 shadow-sm transition-all"
          >
            Explorar Catálogo Completo
          </Link>
        </div>
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
