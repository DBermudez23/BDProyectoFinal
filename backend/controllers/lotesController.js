import { lotes, productos, proveedores } from '../db/schema/productos.js';
import { eq, and, or, like, desc, gte, lte, sql } from 'drizzle-orm';

// ✅ Obtener todos los lotes con información de producto y proveedor
export const obtenerLotes = async (req, res, db) => {
  try {
    const allLotes = await db
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
        producto: {
          nombreComercial: productos.nombreComercial,
          nombreGenerico: productos.nombreGenerico,
          concentracion: productos.concentracion,
          formaFarmaceutica: productos.formaFarmaceutica
        },
        proveedor: {
          nombreProveedor: proveedores.nombreProveedor,
          contactoNombre: proveedores.contactoNombre
        }
      })
      .from(lotes)
      .leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
      .leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
      .orderBy(desc(lotes.createdAt));

    res.json({
      success: true,
      count: allLotes.length,
      data: allLotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lotes',
      error: error.message
    });
  }
};

// ✅ Obtener un lote por ID
export const obtenerLotePorId = async (req, res, db) => {
  try {
    const { id } = req.params;

    const lote = await db
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
        producto: {
          idProducto: productos.idProducto,
          codigoProducto: productos.codigoProducto,
          nombreComercial: productos.nombreComercial,
          nombreGenerico: productos.nombreGenerico,
          principioActivo: productos.principioActivo,
          concentracion: productos.concentracion,
          formaFarmaceutica: productos.formaFarmaceutica,
          viaAdministracion: productos.viaAdministracion,
          presentacion: productos.presentacion
        },
        proveedor: {
          idProveedor: proveedores.idProveedor,
          nombreProveedor: proveedores.nombreProveedor,
          contactoNombre: proveedores.contactoNombre,
          telefono: proveedores.telefono,
          email: proveedores.email
        }
      })
      .from(lotes)
      .leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
      .leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
      .where(eq(lotes.idLote, parseInt(id)));

    if (lote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    res.json({
      success: true,
      data: lote[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el lote',
      error: error.message
    });
  }
};

// ✅ Crear nuevo lote
export const crearLote = async (req, res, db) => {
  try {
    const {
      idProducto,
      idProveedor,
      numeroLote,
      fechaFabricacion,
      fechaVencimiento,
      cantidadRecibida,
      precioCompra,
      precioVenta,
      ubicacion
    } = req.body;

    // Validaciones
    if (!idProducto || !numeroLote || !fechaFabricacion || !fechaVencimiento || !cantidadRecibida) {
      return res.status(400).json({
        success: false,
        message: 'Producto, número de lote, fechas y cantidad son obligatorios'
      });
    }

    // Verificar si el número de lote ya existe
    const loteExistente = await db
      .select()
      .from(lotes)
      .where(eq(lotes.numeroLote, numeroLote));

    if (loteExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El número de lote ya existe'
      });
    }

    // Verificar que el producto existe
    const productoExistente = await db
      .select()
      .from(productos)
      .where(eq(productos.idProducto, parseInt(idProducto)));

    if (productoExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Crear lote
    const nuevoLote = await db
      .insert(lotes)
      .values({
        idProducto: parseInt(idProducto),
        idProveedor: idProveedor ? parseInt(idProveedor) : null,
        numeroLote,
        fechaFabricacion: new Date(fechaFabricacion),
        fechaVencimiento: new Date(fechaVencimiento),
        cantidadRecibida: parseInt(cantidadRecibida),
        cantidadDisponible: parseInt(cantidadRecibida),
        precioCompra: precioCompra || null,
        precioVenta: precioVenta || null,
        ubicacion: ubicacion || null,
        estado: 'Activo'
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Lote creado exitosamente',
      data: nuevoLote[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear lote',
      error: error.message
    });
  }
};

// ✅ Actualizar lote
export const actualizarLote = async (req, res, db) => {
  try {
    const { id } = req.params;
    const {
      idProveedor,
      numeroLote,
      fechaFabricacion,
      fechaVencimiento,
      cantidadRecibida,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      ubicacion,
      estado
    } = req.body;

    // Verificar si el lote existe
    const loteExistente = await db
      .select()
      .from(lotes)
      .where(eq(lotes.idLote, parseInt(id)));

    if (loteExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    // Si se cambia el número de lote, verificar que no exista
    if (numeroLote && numeroLote !== loteExistente[0].numeroLote) {
      const numeroExistente = await db
        .select()
        .from(lotes)
        .where(
          and(
            eq(lotes.numeroLote, numeroLote),
            ne(lotes.idLote, parseInt(id))
          )
        );

      if (numeroExistente.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El número de lote ya está en uso'
        });
      }
    }

    // Preparar campos a actualizar
    const camposActualizar = {};
    if (idProveedor !== undefined) camposActualizar.idProveedor = idProveedor;
    if (numeroLote) camposActualizar.numeroLote = numeroLote;
    if (fechaFabricacion) camposActualizar.fechaFabricacion = new Date(fechaFabricacion);
    if (fechaVencimiento) camposActualizar.fechaVencimiento = new Date(fechaVencimiento);
    if (cantidadRecibida !== undefined) camposActualizar.cantidadRecibida = parseInt(cantidadRecibida);
    if (cantidadDisponible !== undefined) camposActualizar.cantidadDisponible = parseInt(cantidadDisponible);
    if (precioCompra !== undefined) camposActualizar.precioCompra = precioCompra;
    if (precioVenta !== undefined) camposActualizar.precioVenta = precioVenta;
    if (ubicacion !== undefined) camposActualizar.ubicacion = ubicacion;
    if (estado) camposActualizar.estado = estado;

    // Actualizar lote
    const loteActualizado = await db
      .update(lotes)
      .set(camposActualizar)
      .where(eq(lotes.idLote, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: 'Lote actualizado exitosamente',
      data: loteActualizado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lote',
      error: error.message
    });
  }
};

// ✅ Eliminar lote
export const eliminarLote = async (req, res, db) => {
  try {
    const { id } = req.params;

    const loteEliminado = await db
      .delete(lotes)
      .where(eq(lotes.idLote, parseInt(id)))
      .returning();

    if (loteEliminado.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Lote eliminado exitosamente',
      data: loteEliminado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar lote',
      error: error.message
    });
  }
};

// ✅ Obtener lotes por producto
export const obtenerLotesPorProducto = async (req, res, db) => {
  try {
    const { idProducto } = req.params;

    const lotesProducto = await db
      .select({
        idLote: lotes.idLote,
        numeroLote: lotes.numeroLote,
        fechaFabricacion: lotes.fechaFabricacion,
        fechaVencimiento: lotes.fechaVencimiento,
        cantidadDisponible: lotes.cantidadDisponible,
        precioVenta: lotes.precioVenta,
        estado: lotes.estado,
        proveedor: {
          nombreProveedor: proveedores.nombreProveedor
        }
      })
      .from(lotes)
      .leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
      .where(
        and(
          eq(lotes.idProducto, parseInt(idProducto)),
          eq(lotes.estado, 'Activo'),
          gte(lotes.cantidadDisponible, 1)
        )
      )
      .orderBy(lotes.fechaVencimiento);

    res.json({
      success: true,
      count: lotesProducto.length,
      data: lotesProducto
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lotes del producto',
      error: error.message
    });
  }
};

// ✅ Obtener lotes próximos a vencer
export const obtenerLotesProximosVencer = async (req, res, db) => {
  try {
    const { dias = 30 } = req.query;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));

    const lotesProximos = await db
      .select({
        idLote: lotes.idLote,
        numeroLote: lotes.numeroLote,
        fechaVencimiento: lotes.fechaVencimiento,
        cantidadDisponible: lotes.cantidadDisponible,
        producto: {
          nombreComercial: productos.nombreComercial,
          nombreGenerico: productos.nombreGenerico
        },
        proveedor: {
          nombreProveedor: proveedores.nombreProveedor
        }
      })
      .from(lotes)
      .leftJoin(productos, eq(lotes.idProducto, productos.idProducto))
      .leftJoin(proveedores, eq(lotes.idProveedor, proveedores.idProveedor))
      .where(
        and(
          lte(lotes.fechaVencimiento, fechaLimite),
          gte(lotes.fechaVencimiento, new Date()),
          eq(lotes.estado, 'Activo')
        )
      )
      .orderBy(lotes.fechaVencimiento);

    res.json({
      success: true,
      count: lotesProximos.length,
      data: lotesProximos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener lotes próximos a vencer',
      error: error.message
    });
  }
};

// ✅ Actualizar stock de lote
export const actualizarStockLote = async (req, res, db) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo } = req.body; // tipo: 'entrada' o 'salida'

    if (!cantidad || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad y tipo (entrada/salida) son requeridos'
      });
    }

    const loteExistente = await db
      .select()
      .from(lotes)
      .where(eq(lotes.idLote, parseInt(id)));

    if (loteExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    let nuevaCantidad;
    if (tipo === 'entrada') {
      nuevaCantidad = loteExistente[0].cantidadDisponible + parseInt(cantidad);
    } else if (tipo === 'salida') {
      nuevaCantidad = loteExistente[0].cantidadDisponible - parseInt(cantidad);
      if (nuevaCantidad < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo debe ser "entrada" o "salida"'
      });
    }

    // Actualizar stock
    const loteActualizado = await db
      .update(lotes)
      .set({ 
        cantidadDisponible: nuevaCantidad,
        estado: nuevaCantidad === 0 ? 'Agotado' : 'Activo'
      })
      .where(eq(lotes.idLote, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: `Stock ${tipo === 'entrada' ? 'aumentado' : 'disminuido'} exitosamente`,
      data: loteActualizado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};