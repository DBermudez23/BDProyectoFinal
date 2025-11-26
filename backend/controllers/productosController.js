import { schema } from '../db/schema/index.js';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { getDB } from "../db/connection.js"; 

const db = getDB();

const { productos, laboratorios } = schema;

// Obtener todos los productos con información del laboratorio
const obtenerProductos = async (req, res, db) => {
  try {
    const obtenerProductos = await db
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
        contraindicaciones: productos.contraindicaciones,
        efectosSecundarios: productos.efectosSecundarios,
        requiereFormula: productos.requiereFormula,
        activo: productos.activo,
        laboratorio: {
          nombreLaboratorio: laboratorios.nombreLaboratorio
        }
      })
      .from(productos)
      .leftJoin(laboratorios, eq(productos.idLaboratorio, laboratorios.idLaboratorio))
      .orderBy(desc(productos.idProducto));

    res.json({
      success: true,
      count: allProductos.length,
      data: allProductos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res, db) => {
  try {
    const { id } = req.params;

    const producto = await db
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
        contraindicaciones: productos.contraindicaciones,
        efectosSecundarios: productos.efectosSecundarios,
        requiereFormula: productos.requiereFormula,
        activo: productos.activo,
        laboratorio: {
          idLaboratorio: laboratorios.idLaboratorio,
          nombreLaboratorio: laboratorios.nombreLaboratorio,
          telefono: laboratorios.telefono,
          email: laboratorios.email
        }
      })
      .from(productos)
      .leftJoin(laboratorios, eq(productos.idLaboratorio, laboratorios.idLaboratorio))
      .where(eq(productos.idProducto, parseInt(id)));

    if (producto.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
};

// Crear nuevo producto
const crearProducto = async (req, res, db) => {
  try {
    const {
      idLaboratorio,
      codigoProducto,
      nombreComercial,
      nombreGenerico,
      principioActivo,
      concentracion,
      formaFarmaceutica,
      viaAdministracion,
      presentacion,
      contraindicaciones,
      efectosSecundarios,
      requiereFormula
    } = req.body;

    // Validaciones
    if (!codigoProducto || !nombreComercial || !nombreGenerico) {
      return res.status(400).json({
        success: false,
        message: 'Código, nombre comercial y nombre genérico son obligatorios'
      });
    }

    // Verificar si el código ya existe
    const productoExistente = await db
      .select()
      .from(productos)
      .where(eq(productos.codigoProducto, codigoProducto));

    if (productoExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El código de producto ya existe'
      });
    }

    // Crear producto
    const nuevoProducto = await db
      .insert(productos)
      .values({
        idLaboratorio: idLaboratorio || null,
        codigoProducto,
        nombreComercial,
        nombreGenerico,
        principioActivo: principioActivo || null,
        concentracion: concentracion || null,
        formaFarmaceutica: formaFarmaceutica || null,
        viaAdministracion: viaAdministracion || null,
        presentacion: presentacion || null,
        contraindicaciones: contraindicaciones || null,
        efectosSecundarios: efectosSecundarios || null,
        requiereFormula: requiereFormula !== undefined ? requiereFormula : true
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// Actualizar producto
const actualizarProducto = async (req, res, db) => {
  try {
    const { id } = req.params;
    const {
      idLaboratorio,
      codigoProducto,
      nombreComercial,
      nombreGenerico,
      principioActivo,
      concentracion,
      formaFarmaceutica,
      viaAdministracion,
      presentacion,
      contraindicaciones,
      efectosSecundarios,
      requiereFormula,
      activo
    } = req.body;

    // Verificar si el producto existe
    const productoExistente = await db
      .select()
      .from(productos)
      .where(eq(productos.idProducto, parseInt(id)));

    if (productoExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si se cambia el código, verificar que no exista
    if (codigoProducto && codigoProducto !== productoExistente[0].codigoProducto) {
      const codigoExistente = await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.codigoProducto, codigoProducto),
            ne(productos.idProducto, parseInt(id))
          )
        );

      if (codigoExistente.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código de producto ya está en uso'
        });
      }
    }

    // Preparar campos a actualizar
    const camposActualizar = {};
    if (idLaboratorio !== undefined) camposActualizar.idLaboratorio = idLaboratorio;
    if (codigoProducto) camposActualizar.codigoProducto = codigoProducto;
    if (nombreComercial) camposActualizar.nombreComercial = nombreComercial;
    if (nombreGenerico) camposActualizar.nombreGenerico = nombreGenerico;
    if (principioActivo !== undefined) camposActualizar.principioActivo = principioActivo;
    if (concentracion !== undefined) camposActualizar.concentracion = concentracion;
    if (formaFarmaceutica !== undefined) camposActualizar.formaFarmaceutica = formaFarmaceutica;
    if (viaAdministracion !== undefined) camposActualizar.viaAdministracion = viaAdministracion;
    if (presentacion !== undefined) camposActualizar.presentacion = presentacion;
    if (contraindicaciones !== undefined) camposActualizar.contraindicaciones = contraindicaciones;
    if (efectosSecundarios !== undefined) camposActualizar.efectosSecundarios = efectosSecundarios;
    if (requiereFormula !== undefined) camposActualizar.requiereFormula = requiereFormula;
    if (activo !== undefined) camposActualizar.activo = activo;

    // Actualizar producto
    const productoActualizado = await db
      .update(productos)
      .set(camposActualizar)
      .where(eq(productos.idProducto, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// Eliminar producto (soft delete)
const eliminarProducto = async (req, res, db) => {
  try {
    const { id } = req.params;

    const productoEliminado = await db
      .update(productos)
      .set({ activo: false })
      .where(eq(productos.idProducto, parseInt(id)))
      .returning();

    if (productoEliminado.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: productoEliminado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// Buscar productos
const buscarProductos = async (req, res, db) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    const productosEncontrados = await db
      .select({
        idProducto: productos.idProducto,
        codigoProducto: productos.codigoProducto,
        nombreComercial: productos.nombreComercial,
        nombreGenerico: productos.nombreGenerico,
        principioActivo: productos.principioActivo,
        concentracion: productos.concentracion,
        formaFarmaceutica: productos.formaFarmaceutica,
        activo: productos.activo,
        laboratorio: {
          nombreLaboratorio: laboratorios.nombreLaboratorio
        }
      })
      .from(productos)
      .leftJoin(laboratorios, eq(productos.idLaboratorio, laboratorios.idLaboratorio))
      .where(
        or(
          like(productos.nombreComercial, `%${query}%`),
          like(productos.nombreGenerico, `%${query}%`),
          like(productos.principioActivo, `%${query}%`),
          like(productos.codigoProducto, `%${query}%`)
        )
      )
      .limit(20);

    res.json({
      success: true,
      count: productosEncontrados.length,
      data: productosEncontrados
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error.message
    });
  }
};

export {
  obtenerProductoPorId,
  obtenerProductos,
  crearProducto,
  eliminarProducto
};