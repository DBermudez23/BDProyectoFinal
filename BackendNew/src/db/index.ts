// scripts/test-db.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';  // ← Ya lo tienes bien importado
import postgres from 'postgres';
import * as schema from '../db/schema'; // ← ajusta la ruta si es necesario

// Cliente ligero
const client = postgres("postgresql://postgres.rszyrfcqnwuhlvlhglro:dinoramiamor@aws-0-us-west-2.pooler.supabase.com:6543/postgres");
const db = drizzle(client);

export {
  client,
  db,
  schema
};