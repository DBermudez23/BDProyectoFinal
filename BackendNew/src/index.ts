// src/index.ts
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { db } from './db';                    // ← Tu conexión reutilizable
import { usuarios } from './db/schema';        // ← Tu tabla
import { eq } from 'drizzle-orm';
import appRoute from './routes/appRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

//const appRoute = require('./routes/appRoute');
app.use('/api', appRoute);

// Ruta de bienvenida + prueba de conexión
app.get('/', async (req: Request, res: Response) => {
  try {
    const totalUsuarios = await db.select().from(usuarios).limit(10);
    res.json({
      mensaje: '¡Backend con Drizzle + Supabase funcionando perfecto!',
      total_usuarios_en_db: totalUsuarios.length,
      usuarios_muestra: totalUsuarios,
      fecha: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Error conectando a la base de datos',
      detalles: error.message,
    });
  }
});

// Ejemplo: obtener un usuario por email
app.get('/usuario/:email', async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const usuario = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Prueba la conexión → http://localhost:${PORT}`);
});