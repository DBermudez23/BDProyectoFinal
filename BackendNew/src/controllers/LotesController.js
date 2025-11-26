import { eq, desc, like, and, or } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { lotes, productos, proveedores } = schema;

// Obtener lotes con información del producto y proveedor
async function getAllLotes(req, res) {
	try {
		const { buscar = '' } = req.query;
		const whereConditions = [];
		if (buscar) {
			whereConditions.push(
				or(
					like(lotes.numeroLote, `%${buscar}%`),
					like(productos.nombreComercial, `%${buscar}%`),
					like(productos.nombreGenerico, `%${buscar}%`)
				)
			);
		}

		const rows = await db
			.select({
				idLote: lotes.idLote,
				idProducto: lotes.idProducto,
				idProveedor: lotes.idProveedor,
				numeroLote: lotes.numeroLote,
				fechaFabricacion: lotes.fechaFabricacion,
				fechaVencimiento: lotes.fechaVencimiento,
				cantidadRecibida: lotes.cantidadRecibida,
				cantidadDisponible: lotes.cantidadDisponible,
				precioCompra: lotes.precioCompra,
				precioVenta: lotes.precioVenta,
				ubicacion: lotes.ubicacion,
				estado: lotes.estado,
				createdAt: lotes.createdAt,
				// producto
				productoId: productos.idProducto,
				productoNombre: productos.nombreComercial,
				productoGenerico: productos.nombreGenerico,
				// proveedor
				proveedorId: proveedores.idProveedor,
				proveedorNombre: proveedores.nombreProveedor,
			})
			.from(lotes)
			.leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
			.leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
			.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
			.orderBy(desc(lotes.createdAt));

		return res.status(200).json({ success: true, data: rows, total: rows.length });
	} catch (error) {
		console.error('getAllLotes error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener lotes' });
	}
}

// Obtener lote por id (incluye producto y proveedor)
async function getLoteById(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
	try {
		const rows = await db
			.select({
				idLote: lotes.idLote,
				idProducto: lotes.idProducto,
				idProveedor: lotes.idProveedor,
				numeroLote: lotes.numeroLote,
				fechaFabricacion: lotes.fechaFabricacion,
				fechaVencimiento: lotes.fechaVencimiento,
				cantidadRecibida: lotes.cantidadRecibida,
				cantidadDisponible: lotes.cantidadDisponible,
				precioCompra: lotes.precioCompra,
				precioVenta: lotes.precioVenta,
				ubicacion: lotes.ubicacion,
				estado: lotes.estado,
				createdAt: lotes.createdAt,
				productoId: productos.idProducto,
				productoNombre: productos.nombreComercial,
				proveedorId: proveedores.idProveedor,
				proveedorNombre: proveedores.nombreProveedor,
			})
			.from(lotes)
			.leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
			.leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
			.where(eq(lotes.idLote, id))
			.limit(1);

		if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Lote no encontrado' });
		return res.status(200).json({ success: true, data: rows[0] });
	} catch (error) {
		console.error('getLoteById error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener lote' });
	}
}

// Crear lote (transacción): insertar lote y devolverlo
async function createLote(req, res) {
	try {
		const body = req.body || {};
		const {
			idProducto,
			idProveedor = null,
			numeroLote,
			fechaFabricacion,
			fechaVencimiento,
			cantidadRecibida = 0,
			cantidadDisponible = null,
			precioCompra = null,
			precioVenta = null,
			ubicacion = null,
			estado = 'Activo',
		} = body;

		if (!idProducto || !numeroLote || !fechaFabricacion || !fechaVencimiento) {
			return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para crear lote' });
		}

		const result = await db.transaction(async (tx) => {
			const [inserted] = await tx.insert(lotes).values({
				idProducto,
				idProveedor,
				numeroLote,
				fechaFabricacion,
				fechaVencimiento,
				cantidadRecibida,
				cantidadDisponible: cantidadDisponible ?? cantidadRecibida,
				precioCompra,
				precioVenta,
				ubicacion,
				estado,
			}).returning({ idLote: lotes.idLote });

			const loteId = inserted && (inserted.idLote ?? inserted.id_lote ?? inserted.id);
			if (!loteId) throw new Error('No se pudo recuperar idLote después de insertar lote');

			const loteCompleto = await tx
				.select({
					idLote: lotes.idLote,
					idProducto: lotes.idProducto,
					idProveedor: lotes.idProveedor,
					numeroLote: lotes.numeroLote,
					fechaFabricacion: lotes.fechaFabricacion,
					fechaVencimiento: lotes.fechaVencimiento,
					cantidadRecibida: lotes.cantidadRecibida,
					cantidadDisponible: lotes.cantidadDisponible,
					precioCompra: lotes.precioCompra,
					precioVenta: lotes.precioVenta,
					ubicacion: lotes.ubicacion,
					estado: lotes.estado,
					productoNombre: productos.nombreComercial,
					proveedorNombre: proveedores.nombreProveedor,
				})
				.from(lotes)
				.leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
				.leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
				.where(eq(lotes.idLote, loteId))
				.limit(1);

			return loteCompleto[0];
		});

		return res.status(201).json({ success: true, data: result });
	} catch (error) {
		console.error('createLote error:', error);
		return res.status(500).json({ success: false, message: 'Error al crear lote' });
	}
}

// Actualizar lote
async function updateLote(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
		const body = req.body || {};

		const updated = await db.update(lotes).set(body).where(eq(lotes.idLote, id)).returning();
		if (!updated || updated.length === 0) return res.status(404).json({ success: false, message: 'Lote no encontrado' });

		return res.status(200).json({ success: true, data: updated[0] });
	} catch (error) {
		console.error('updateLote error:', error);
		return res.status(500).json({ success: false, message: 'Error al actualizar lote' });
	}
}

// Eliminación lógica de lote (marcar estado)
async function deleteLote(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

		const exists = await db.select({ idLote: lotes.idLote }).from(lotes).where(eq(lotes.idLote, id)).limit(1);
		if (!exists || exists.length === 0) return res.status(404).json({ success: false, message: 'Lote no encontrado' });

		await db.update(lotes).set({ estado: 'Inactivo' }).where(eq(lotes.idLote, id));
		return res.status(200).json({ success: true, message: 'Lote marcado como inactivo' });
	} catch (error) {
		console.error('deleteLote error:', error);
		return res.status(500).json({ success: false, message: 'Error al eliminar lote' });
	}
}

export {
	getAllLotes,
	getLoteById,
	createLote,
	updateLote,
	deleteLote,
};

