import { Client } from 'pg'

/**
 * Ejecuta una consulta SQL contra la base de datos PostgreSQL.
 *
 * Abre una conexión nueva, ejecuta la consulta, y cierra la conexión
 * al terminar (haya sido exitosa o no). Pensado para uso simple/didáctico;
 * en un entorno con muchas peticiones concurrentes se preferiría un
 * Pool de conexiones reutilizables en vez de abrir/cerrar una por consulta.
 *
 * @param sql - La sentencia SQL a ejecutar. Usa placeholders $1, $2, ...
 *              en vez de concatenar valores directamente, para evitar
 *              inyección SQL.
 * @param params - Arreglo opcional de valores que reemplazan los
 *                  placeholders $1, $2, ... del SQL, en orden.
 * @returns El objeto resultado de 'pg', que incluye .rows (las filas
 *          devueltas) y .rowCount (cuántas filas fueron afectadas).
 */
export async function query(sql: string, params?: any[]) {
  // Crea una nueva instancia de conexión, configurada con la URL
  // de conexión leída desde la variable de entorno DATABASE_URL
  // (definida en el archivo .env).
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  // Abre la conexión real hacia PostgreSQL (handshake de red + autenticación).
  // 'await' pausa esta función hasta que la conexión esté lista.
  await client.connect()

  try {
    // Ejecuta la consulta SQL, reemplazando $1, $2, ... por los valores
    // de 'params' de forma segura (el driver se encarga de escapar
    // cada valor para prevenir inyección SQL).
    const resultado = await client.query(sql, params)
    return resultado
  } finally {
    // Se ejecuta siempre, sin importar si la consulta tuvo éxito o
    // lanzó un error. Cierra la conexión para no dejarla abierta
    // indefinidamente (evita agotar el límite de conexiones de Postgres).
    await client.end()
  }
}