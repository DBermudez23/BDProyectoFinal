const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.pqcxsbtuittbfchembsn:PostgresDB_2024_Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
});

async function test() {
  try {
    await client.connect();
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    const result = await client.query('SELECT version()');
    console.log('Versión de PostgreSQL:', result.rows[0].version);
    await client.end();
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

test();