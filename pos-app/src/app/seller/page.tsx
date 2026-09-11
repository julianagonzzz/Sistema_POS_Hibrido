import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { obtenerInfoVendedor, buscarClientes } from "@/lib/vendedores";
import { listarProductos } from "@/lib/productos";
import PanelSeller from "./PanelSeller";

export default async function SellerPage() {
  const sesion = await obtenerSesion();

  // Control de acceso para rol VENDEDOR
  if (!sesion) {
    redirect("/login");
  }

  if (sesion.tipo_usuario !== "VENDEDOR") {
    redirect("/");
  }

  const [vendedorInfo, productos, clientes] = await Promise.all([
    obtenerInfoVendedor(Number(sesion.id_usuario)),
    listarProductos(),
    buscarClientes(),
  ]);

  if (!vendedorInfo) {
    redirect("/login");
  }

  return (
    <PanelSeller
      vendedor={vendedorInfo}
      productosIniciales={productos}
      clientesIniciales={clientes}
    />
  );
}
