// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connection.js';

(async () => {
  try {
    const db = await connectDB();        // ← Obtenemos la instancia
    console.log('Base de datos lista');

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
      res.json({ 
        message: '¡Backend activo!',
        timestamp: new Date().toISOString()
      });
    });

    // IMPORTANTE: ahora pasamos db a las rutas
    const { default: userRoutes } = await import('./routes/userRoute.js');
    app.use('/api/users', userRoutes(db));   // ← le pasamos db

    // 404
    app.use((req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
})();