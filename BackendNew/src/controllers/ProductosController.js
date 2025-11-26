import { eq, desc, like, and, or } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { productos, laboratorios } = schema;

// Obtener todos los productos con datos del laboratorio (opcional búsqueda)
async function getAllProductos(req, res) {
	try {
		const { buscar = '' } = req.query;
		const whereConditions = [];
		if (buscar) {
			whereConditions.push(
				or(
					like(productos.nombreComercial, `%${buscar}%`),
					like(productos.nombreGenerico, `%${buscar}%`),
					like(productos.codigoProducto, `%${buscar}%`)
				)
			);
		}

		const rows = await db
			.select({
				idProducto: productos.idProducto,
				idLaboratorio: productos.idLaboratorio,
				codigoProducto: productos.codigoProducto,
				nombreComercial: productos.nombreComercial,
				nombreGenerico: productos.nombreGenerico,
				principioActivo: productos.principioActivo,
				concentracion: productos.concentracion,
				formaFarmaceutica: productos.formaFarmaceutica,
				viaAdministracion: productos.viaAdministracion,
				presentacion: productos.presentacion,
				requiereFormula: productos.requiereFormula,
				activo: productos.activo,
				// laboratorio
				laboratorioId: laboratorios.idLaboratorio,
				laboratorioNombre: laboratorios.nombreLaboratorio,
			})
			.from(productos)
			.leftJoin(laboratorios, eq(productos.idLaboratorio, laboratorios.idLaboratorio))
			.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
			.orderBy(desc(productos.idProducto));

		return res.status(200).json({ success: true, data: rows, total: rows.length });
	} catch (error) {
		console.error('getAllProductos error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener productos' });
	}
}

// Obtener producto por id (incluye laboratorio)
async function getProductoById(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
	try {
		const rows = await db
			.select({
				idProducto: productos.idProducto,
				idLaboratorio: productos.idLaboratorio,
				codigoProducto: productos.codigoProducto,
				nombreComercial: productos.nombreComercial,
				nombreGenerico: productos.nombreGenerico,
				principioActivo: productos.principioActivo,
				concentracion: productos.concentracion,
				formaFarmaceutica: productos.formaFarmaceutica,
				viaAdministracion: productos.viaAdministracion,
				presentacion: productos.presentacion,
				requiereFormula: productos.requiereFormula,
				activo: productos.activo,
				laboratorioId: laboratorios.idLaboratorio,
				laboratorioNombre: laboratorios.nombreLaboratorio,
			})
			.from(productos)
			.leftJoin(laboratorios, eq(productos.idLaboratorio, laboratorios.idLaboratorio))
			.where(eq(productos.idProducto, id))
			.limit(1);

		if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
		return res.status(200).json({ success: true, data: rows[0] });
	} catch (error) {
		console.error('getProductoById error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener producto' });
	}
}

// Crear producto
async function createProducto(req, res) {
	try {
		const body = req.body || {};
		const { codigoProducto, nombreComercial, nombreGenerico } = body;
		if (!codigoProducto || !nombreComercial || !nombreGenerico) {
			return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para crear producto' });
		}

		// Verificar unicidad de codigoProducto
		const existente = await db.select({ idProducto: productos.idProducto }).from(productos).where(eq(productos.codigoProducto, codigoProducto)).limit(1);
		if (existente.length > 0) return res.status(409).json({ success: false, message: 'Código de producto ya existe' });

		const inserted = await db.insert(productos).values({
			idLaboratorio: body.idLaboratorio || null,
			codigoProducto,
			nombreComercial,
			nombreGenerico,
			principioActivo: body.principioActivo || null,
			concentracion: body.concentracion || null,
			formaFarmaceutica: body.formaFarmaceutica || null,
			viaAdministracion: body.viaAdministracion || null,
			presentacion: body.presentacion || null,
			requiereFormula: body.requiereFormula ?? true,
			activo: body.activo ?? true,
		}).returning({ idProducto: productos.idProducto });

		const prod = inserted[0];
		return res.status(201).json({ success: true, data: prod });
	} catch (error) {
		console.error('createProducto error:', error);
		return res.status(500).json({ success: false, message: 'Error al crear producto' });
	}
}

// Actualizar producto
async function updateProducto(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
		const body = req.body || {};

		const updated = await db.update(productos).set(body).where(eq(productos.idProducto, id)).returning();
		if (!updated || updated.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
		return res.status(200).json({ success: true, data: updated[0] });
	} catch (error) {
		console.error('updateProducto error:', error);
		return res.status(500).json({ success: false, message: 'Error al actualizar producto' });
	}
}

// Eliminación lógica de producto (marcar como inactivo)
async function deleteProducto(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

		const exists = await db.select({ idProducto: productos.idProducto }).from(productos).where(eq(productos.idProducto, id)).limit(1);
		if (!exists || exists.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

		await db.update(productos).set({ activo: false }).where(eq(productos.idProducto, id));
		return res.status(200).json({ success: true, message: 'Producto desactivado' });
	} catch (error) {
		console.error('deleteProducto error:', error);
		return res.status(500).json({ success: false, message: 'Error al eliminar producto' });
	}
}

export {
	getAllProductos,
	getProductoById,
	createProducto,
	updateProducto,
	deleteProducto,
};

