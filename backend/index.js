import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

// Inicializar cliente de PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase (PostgreSQL)');

    // Inicializar Drizzle con el cliente
    const db = drizzle(client);

    // Inicializar Express
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(express.json());

    // Ruta de prueba principal
    app.get('/', (req, res) => {
      res.json({ 
        message: '¡Backend con Express + Drizzle + Supabase activo!',
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    });

    // Ruta de prueba de base de datos
    app.get('/test-db', async (req, res) => {
      try {
        const result = await client.query('SELECT NOW() as current_time');
        res.json({ 
          message: 'Conexión a BD exitosa',
          currentTime: result.rows[0].current_time,
          database: 'Supabase PostgreSQL',
          status: 'success'
        });
      } catch (error) {
        console.error('Error en test-db:', error);
        res.status(500).json({ 
          error: 'Error de base de datos',
          message: error.message,
          status: 'error'
        });
      }
    });

    // Ruta de salud del sistema
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        service: 'Backend API',
        timestamp: new Date().toISOString(),
        database: 'Connected',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Ruta de ejemplo para usuarios (sin base de datos por ahora)
    app.get('/api/users', (req, res) => {
      res.json({
        message: 'Ruta de usuarios funcionando',
        users: [],
        status: 'success'
      });
    });

    // Ruta de ejemplo para productos
    app.get('/api/products', (req, res) => {
      res.json({
        message: 'Ruta de productos funcionando',
        products: [],
        status: 'success'
      });
    });

    // Manejo de rutas no encontradas - VERSIÓN SIMPLIFICADA
    app.use((req, res) => {
      res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        status: 'error'
      });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 Rutas disponibles:`);
      console.log(`   http://localhost:${PORT}/`);
      console.log(`   http://localhost:${PORT}/health`);
      console.log(`   http://localhost:${PORT}/test-db`);
      console.log(`   http://localhost:${PORT}/api/users`);
      console.log(`   http://localhost:${PORT}/api/products`);
    });

  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
})();