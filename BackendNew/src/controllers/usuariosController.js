import { db, schema } from '../db/index.js';
const { usuarios } = schema;
import { eq } from 'drizzle-orm';

async function getAllUsuarios(req, res) {
  try {
    const rows = await db.select().from(usuarios);
    return res.json(rows);
  } catch (error) {
    console.error('getAllUsuarios error:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios', detalles: error.message });
  }
}

async function getUsuarioById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const rows = await db.select().from(usuarios).where(eq(usuarios.idUsuario, id)).limit(1);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('getUsuarioById error:', error);
    return res.status(500).json({ error: 'Error al obtener usuario', detalles: error.message });
  }
}

async function createUsuario(req, res) {
  const body = req.body || {};
  try {
    const inserted = await db.insert(usuarios).values(body).returning();
    return res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('createUsuario error:', error);
    return res.status(500).json({ error: 'Error al crear usuario', detalles: error.message });
  }
}

async function updateUsuario(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  const body = req.body || {};
  try {
    const updated = await db.update(usuarios).set(body).where(eq(usuarios.idUsuario, id)).returning();
    if (!updated || updated.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(updated[0]);
  } catch (error) {
    console.error('updateUsuario error:', error);
    return res.status(500).json({ error: 'Error al actualizar usuario', detalles: error.message });
  }
}

async function deleteUsuario(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const deleted = await db.delete(usuarios).where(eq(usuarios.idUsuario, id)).returning();
    if (!deleted || deleted.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json({ message: 'Usuario eliminado', usuario: deleted[0] });
  } catch (error) {
    console.error('deleteUsuario error:', error);
    return res.status(500).json({ error: 'Error al eliminar usuario', detalles: error.message });
  }
}

export {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
