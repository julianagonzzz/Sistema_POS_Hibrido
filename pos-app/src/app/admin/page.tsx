// Página servidor: aquí se cumple el criterio 6 a nivel de pantalla
// ("El acceso al panel está restringido al rol de administrador").
// Las rutas de API ya lo validan también, pero esto evita que alguien
// sin sesión de admin vea siquiera el HTML de la pantalla.

import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import PanelAdmin from "./PanelAdmin";

export default async function AdminPage() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect("/login");
    }
    if (sesion.tipo_usuario !== "ADMIN") {
        // Un vendedor o cliente que intente entrar directo por la URL
        // no ve el panel, lo mandamos a la raíz.
        redirect("/");
    }

    return <PanelAdmin nombreAdmin={sesion.nombre} />;
}
