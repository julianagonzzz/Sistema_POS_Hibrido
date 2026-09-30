const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envFile = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envFile, 'utf8');

let connectionString = '';
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === 'POSTGRES_URL' || (key === 'DATABASE_URL' && !connectionString)) {
      connectionString = val;
    }
  }
}

console.log('Connecting to PostgreSQL...');
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const sqlPath = path.join(__dirname, '..', '..', 'sql', '03_productos_ktronix.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing 03_productos_ktronix.sql...');
    await pool.query(sql);
    console.log('Seed executed successfully!');

    const res = await pool.query('SELECT id_producto, nombre, precio, categoria, imagen_url FROM producto ORDER BY id_producto ASC;');
    console.log(`Total products now: ${res.rows.length}`);
    res.rows.forEach(p => {
      console.log(`- [#${p.id_producto}] [${p.categoria}] ${p.nombre} | $${p.precio} | img: ${p.imagen_url}`);
    });
  } catch (err) {
    console.error('Error executing seed:', err);
  } finally {
    await pool.end();
  }
}

main();
