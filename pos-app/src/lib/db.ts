// Importa la funcionalidad Pool de la librería postgres, que abre una coleccion de conexiones a la bd
import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pgPool: Pool }
// Prepara un espacio en globalThis donde vamos a guardar la instancia,
// para reutilizarla entre recargas en modo desarrollo

export const pool = globalForPg.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
// Si ya existe una instancia guardada, la reutiliza (globalForPg.pgPool);
// si no existe (primera vez que corre), crea una nueva con 'new Pool(...)'

