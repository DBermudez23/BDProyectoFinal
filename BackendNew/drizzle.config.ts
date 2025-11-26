import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url:"postgresql://postgres.rszyrfcqnwuhlvlhglro:dinoramiamor@aws-0-us-west-2.pooler.supabase.com:6543/postgres",
  },
});
