// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

// Importar rutas
import userRoutes from './src/routes/users.js';

// Inicializar cliente de PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log('Conectado a Supabase (PostgreSQL)');

    // Inicializar Drizzle con el cliente
    const db = drizzle(client);

    // Inicializar Express
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(express.json());

    // Ruta de prueba
    app.get('/', (req, res) => {
      res.json({ message: '¡Backend con Express + Drizzle + Supabase activo!' });
    });

    // Montar rutas
    app.use('/api/users', userRoutes(db));

    // Manejo de rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
})();