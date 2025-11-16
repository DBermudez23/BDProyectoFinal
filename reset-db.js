// reset-db.js
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.pqcxsbtuittbfchembsn:PostgresDB_2024_Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
});

async function reset() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase');
    
    // Elimina todas las tablas existentes en el orden correcto (por dependencias)
    await client.query(`
      DROP TABLE IF EXISTS dispensaciones CASCADE;
      DROP TABLE IF EXISTS detalles_receta CASCADE;
      DROP TABLE IF EXISTS recetas CASCADE;
      DROP TABLE IF EXISTS lotes CASCADE;
      DROP TABLE IF EXISTS productos CASCADE;
      DROP TABLE IF EXISTS proveedores CASCADE;
      DROP TABLE IF EXISTS laboratorios CASCADE;
      DROP TABLE IF EXISTS medicos CASCADE;
      DROP TABLE IF EXISTS pacientes CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
      DROP TABLE IF EXISTS roles_permisos CASCADE;
      DROP TABLE IF EXISTS permisos CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
    `);
    
    console.log('✅ Todas las tablas eliminadas correctamente');
    await client.end();
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

reset();