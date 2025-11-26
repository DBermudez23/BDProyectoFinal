import { db, schema } from '../db/index.js';
const { laboratorios } = schema;
import { eq } from 'drizzle-orm';

async function getAllLaboratorios(req, res) {
  try {
    const rows = await db.select().from(laboratorios);
    return res.json(rows);
  } catch (error) {
    console.error('getAllLaboratorios error:', error);
    return res.status(500).json({ error: 'Error al obtener laboratorios', detalles: error.message });
  }
}

async function getLaboratorioById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const rows = await db.select().from(laboratorios).where(eq(laboratorios.idLaboratorio, id)).limit(1);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Laboratorio no encontrado' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('getLaboratorioById error:', error);
    return res.status(500).json({ error: 'Error al obtener laboratorio', detalles: error.message });
  }
}

async function createLaboratorio(req, res) {
  const body = req.body || {};
  try {
    const inserted = await db.insert(laboratorios).values(body).returning();
    return res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('createLaboratorio error:', error);
    return res.status(500).json({ error: 'Error al crear laboratorio', detalles: error.message });
  }
}

async function updateLaboratorio(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  const body = req.body || {};
  try {
    const updated = await db.update(laboratorios).set(body).where(eq(laboratorios.idLaboratorio, id)).returning();
    if (!updated || updated.length === 0) return res.status(404).json({ error: 'Laboratorio no encontrado' });
    return res.json(updated[0]);
  } catch (error) {
    console.error('updateLaboratorio error:', error);
    return res.status(500).json({ error: 'Error al actualizar laboratorio', detalles: error.message });
  }
}

async function deleteLaboratorio(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const deleted = await db.delete(laboratorios).where(eq(laboratorios.idLaboratorio, id)).returning();
    if (!deleted || deleted.length === 0) return res.status(404).json({ error: 'Laboratorio no encontrado' });
    return res.json({ message: 'Laboratorio eliminado', laboratorio: deleted[0] });
  } catch (error) {
    console.error('deleteLaboratorio error:', error);
    return res.status(500).json({ error: 'Error al eliminar laboratorio', detalles: error.message });
  }
}

export {
  getAllLaboratorios,
  getLaboratorioById,
  createLaboratorio,
  updateLaboratorio,
  deleteLaboratorio,
};
