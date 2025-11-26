// db/connection.js
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/index.js';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const connectDB = async () => {
  await client.connect();
  console.log('Conectado a PostgreSQL');
  const db = drizzle(client, { schema });
  return db; // devolvemos la instancia de drizzle
};