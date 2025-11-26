import { db, schema } from '../db/index.js';
const { recetas, detallesReceta } = schema;
import { eq } from 'drizzle-orm';

/**
 * Controlador para `recetas` y `detalles_receta`.
 * Exporta funciones: getAllRecetas, getRecetaById, createReceta, updateReceta, deleteReceta
 */

async function getAllRecetas(req, res) {
	try {
		const rows = await db.select().from(recetas);
		return res.status(200).json({ success: true, data: rows, total: rows.length });
	} catch (error) {
		console.error('getAllRecetas error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener recetas', detalles: error.message });
	}
}

async function getRecetaById(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

	try {
		const recetaRows = await db.select().from(recetas).where(eq(recetas.idReceta, id)).limit(1);
		if (!recetaRows || recetaRows.length === 0) return res.status(404).json({ success: false, message: 'Receta no encontrada' });

		const receta = recetaRows[0];
		const detalles = await db.select().from(detallesReceta).where(eq(detallesReceta.idReceta, id));

		return res.status(200).json({ success: true, data: { receta, detalles } });
	} catch (error) {
		console.error('getRecetaById error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener la receta', detalles: error.message });
	}
}

async function createReceta(req, res) {
	const body = req.body || {};

	// Campos esperados para la receta (ajusta según tu front-end)
	const {
		idPaciente,
		idMedico,
		codigoReceta,
		diagnosticoPrincipal,
		instruccionesGenerales,
		estado,
		validada,
		detalles, // array de objetos con campos de detalle
	} = body;

	if (!idPaciente || !idMedico || !codigoReceta || !diagnosticoPrincipal) {
		return res.status(400).json({ error: 'Faltan campos requeridos para la receta' });
	}

	try {
		const inserted = await db.insert(recetas).values({
			idPaciente,
			idMedico,
			codigoReceta,
			diagnosticoPrincipal,
			instruccionesGenerales: instruccionesGenerales || null,
			estado: estado || 'Activa',
			validada: typeof validada === 'boolean' ? validada : false,
		}).returning();

		const nuevaReceta = inserted[0];

		let insertedDetalles = [];
		if (Array.isArray(detalles) && detalles.length > 0) {
			const detallesToInsert = detalles.map((d) => ({
				idReceta: nuevaReceta.idReceta,
				idProducto: d.idProducto,
				dosis: d.dosis || null,
				frecuencia: d.frecuencia || null,
				viaAdministracion: d.viaAdministracion || null,
				duracionTratamiento: d.duracionTratamiento || null,
				cantidadPrescrita: d.cantidadPrescrita || 0,
				observaciones: d.observaciones || null,
				posologia: d.posologia || null,
			}));

			insertedDetalles = await db.insert(detallesReceta).values(...detallesToInsert).returning();
		}

		return res.status(201).json({ success: true, data: { receta: nuevaReceta, detalles: insertedDetalles } });
	} catch (error) {
		console.error('createReceta error:', error);
		return res.status(500).json({ success: false, message: 'Error al crear la receta', detalles: error.message });
	}
}

async function updateReceta(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

	const body = req.body || {};

	try {
		const updatePayload = {};
		const allowed = [
			'idPaciente',
			'idMedico',
			'codigoReceta',
			'diagnosticoPrincipal',
			'instruccionesGenerales',
			'estado',
			'validada',
		];
		for (const k of allowed) {
			if (Object.prototype.hasOwnProperty.call(body, k)) updatePayload[k] = body[k];
		}

		const updated = await db.update(recetas).set(updatePayload).where(eq(recetas.idReceta, id)).returning();
		if (!updated || updated.length === 0) return res.status(404).json({ success: false, message: 'Receta no encontrada' });

		// Manejo sencillo de detalles: si vienen detalles en el body, los reemplazamos
		let detallesResult = [];
		if (Array.isArray(body.detalles)) {
			// borrar existentes
			await db.delete(detallesReceta).where(eq(detallesReceta.idReceta, id));

			const detallesToInsert = body.detalles.map((d) => ({
				idReceta: id,
				idProducto: d.idProducto,
				dosis: d.dosis || null,
				frecuencia: d.frecuencia || null,
				viaAdministracion: d.viaAdministracion || null,
				duracionTratamiento: d.duracionTratamiento || null,
				cantidadPrescrita: d.cantidadPrescrita || 0,
				observaciones: d.observaciones || null,
				posologia: d.posologia || null,
			}));

			if (detallesToInsert.length > 0) {
				detallesResult = await db.insert(detallesReceta).values(...detallesToInsert).returning();
			}
		}

		return res.status(200).json({ success: true, data: { receta: updated[0], detalles: detallesResult } });
	} catch (error) {
		console.error('updateReceta error:', error);
		return res.status(500).json({ success: false, message: 'Error al actualizar la receta', detalles: error.message });
	}
}

async function deleteReceta(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

	try {
		// borrar detalles primero
		await db.delete(detallesReceta).where(eq(detallesReceta.idReceta, id));
		const deleted = await db.delete(recetas).where(eq(recetas.idReceta, id)).returning();
		if (!deleted || deleted.length === 0) return res.status(404).json({ success: false, message: 'Receta no encontrada' });

		return res.status(200).json({ success: true, data: { receta: deleted[0] } });
	} catch (error) {
		console.error('deleteReceta error:', error);
		return res.status(500).json({ success: false, message: 'Error al eliminar la receta', detalles: error.message });
	}
}

export {
	getAllRecetas,
	getRecetaById,
	createReceta,
	updateReceta,
	deleteReceta,
};
