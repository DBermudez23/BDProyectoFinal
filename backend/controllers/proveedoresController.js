import { proveedores } from '../db/schema/products.js';
import { eq, and, or, like, desc } from 'drizzle-orm';

// ✅ Obtener todos los proveedores
export const obtenerProveedores = async (req, res, db) => {
try {
    const allProveedores = await db
    .select({
        idProveedor: proveedores.idProveedor,
        nombreProveedor: proveedores.nombreProveedor,
        contactoNombre: proveedores.contactoNombre,
        telefono: proveedores.telefono,
        email: proveedores.email,
        direccion: proveedores.direccion,
        activo: proveedores.activo
    })
    .from(proveedores)
    .orderBy(proveedores.nombreProveedor);

    res.json({
    success: true,
    count: allProveedores.length,
    data: allProveedores
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al obtener proveedores',
    error: error.message
    });
}
};

// ✅ Obtener un proveedor por ID
export const obtenerProveedorPorId = async (req, res, db) => {
try {
    const { id } = req.params;

    const proveedor = await db
    .select({
        idProveedor: proveedores.idProveedor,
        nombreProveedor: proveedores.nombreProveedor,
        contactoNombre: proveedores.contactoNombre,
        telefono: proveedores.telefono,
        email: proveedores.email,
        direccion: proveedores.direccion,
        activo: proveedores.activo
    })
    .from(proveedores)
    .where(eq(proveedores.idProveedor, parseInt(id)));

    if (proveedor.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
    });
    }

    res.json({
    success: true,
    data: proveedor[0]
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al obtener el proveedor',
    error: error.message
    });
}
};

// ✅ Crear nuevo proveedor
export const crearProveedor = async (req, res, db) => {
try {
    const {
    nombreProveedor,
    contactoNombre,
    telefono,
    email,
    direccion
    } = req.body;

    // Validaciones
    if (!nombreProveedor) {
    return res.status(400).json({
        success: false,
        message: 'El nombre del proveedor es obligatorio'
    });
    }

    // Verificar si el proveedor ya existe
    const proveedorExistente = await db
    .select()
    .from(proveedores)
    .where(eq(proveedores.nombreProveedor, nombreProveedor));

    if (proveedorExistente.length > 0) {
    return res.status(400).json({
        success: false,
        message: 'El nombre del proveedor ya existe'
    });
    }

    // Crear proveedor
    const nuevoProveedor = await db
    .insert(proveedores)
    .values({
        nombreProveedor,
        contactoNombre: contactoNombre || null,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        activo: true
    })
    .returning();

    res.status(201).json({
    success: true,
    message: 'Proveedor creado exitosamente',
    data: nuevoProveedor[0]
    });

} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al crear proveedor',
    error: error.message
    });
}
};

// ✅ Actualizar proveedor
export const actualizarProveedor = async (req, res, db) => {
try {
    const { id } = req.params;
    const {
    nombreProveedor,
    contactoNombre,
    telefono,
    email,
    direccion,
    activo
    } = req.body;

    // Verificar si el proveedor existe
    const proveedorExistente = await db
    .select()
    .from(proveedores)
    .where(eq(proveedores.idProveedor, parseInt(id)));

    if (proveedorExistente.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
    });
    }

    // Si se cambia el nombre, verificar que no exista
    if (nombreProveedor && nombreProveedor !== proveedorExistente[0].nombreProveedor) {
    const nombreExistente = await db
        .select()
        .from(proveedores)
        .where(
        and(
            eq(proveedores.nombreProveedor, nombreProveedor),
            ne(proveedores.idProveedor, parseInt(id))
        )
        );

    if (nombreExistente.length > 0) {
        return res.status(400).json({
        success: false,
        message: 'El nombre del proveedor ya está en uso'
        });
    }
    }

    // Preparar campos a actualizar
    const camposActualizar = {};
    if (nombreProveedor) camposActualizar.nombreProveedor = nombreProveedor;
    if (contactoNombre !== undefined) camposActualizar.contactoNombre = contactoNombre;
    if (telefono !== undefined) camposActualizar.telefono = telefono;
    if (email !== undefined) camposActualizar.email = email;
    if (direccion !== undefined) camposActualizar.direccion = direccion;
    if (activo !== undefined) camposActualizar.activo = activo;

    // Actualizar proveedor
    const proveedorActualizado = await db
    .update(proveedores)
    .set(camposActualizar)
    .where(eq(proveedores.idProveedor, parseInt(id)))
    .returning();

    res.json({
    success: true,
    message: 'Proveedor actualizado exitosamente',
    data: proveedorActualizado[0]
    });

} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al actualizar proveedor',
    error: error.message
    });
}
};

// ✅ Eliminar proveedor (soft delete)
export const eliminarProveedor = async (req, res, db) => {
try {
    const { id } = req.params;

    const proveedorEliminado = await db
    .update(proveedores)
    .set({ activo: false })
    .where(eq(proveedores.idProveedor, parseInt(id)))
    .returning();

    if (proveedorEliminado.length === 0) {
    return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
    });
    }

    res.json({
    success: true,
    message: 'Proveedor eliminado exitosamente',
    data: proveedorEliminado[0]
    });

} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al eliminar proveedor',
    error: error.message
    });
}
};

// ✅ Buscar proveedores
export const buscarProveedores = async (req, res, db) => {
try {
    const { query } = req.query;

    if (!query) {
    return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
    });
    }

    const proveedoresEncontrados = await db
    .select({
        idProveedor: proveedores.idProveedor,
        nombreProveedor: proveedores.nombreProveedor,
        contactoNombre: proveedores.contactoNombre,
        telefono: proveedores.telefono,
        email: proveedores.email,
        activo: proveedores.activo
    })
    .from(proveedores)
    .where(
        and(
        eq(proveedores.activo, true),
        or(
            like(proveedores.nombreProveedor, `%${query}%`),
            like(proveedores.contactoNombre, `%${query}%`),
            like(proveedores.email, `%${query}%`)
        )
        )
    )
    .limit(20);

    res.json({
    success: true,
    count: proveedoresEncontrados.length,
    data: proveedoresEncontrados
    });

} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al buscar proveedores',
    error: error.message
    });
}
};

// ✅ Obtener proveedores activos
export const obtenerProveedoresActivos = async (req, res, db) => {
try {
    const proveedoresActivos = await db
    .select({
        idProveedor: proveedores.idProveedor,
        nombreProveedor: proveedores.nombreProveedor,
        contactoNombre: proveedores.contactoNombre,
        telefono: proveedores.telefono,
        email: proveedores.email
    })
    .from(proveedores)
    .where(eq(proveedores.activo, true))
    .orderBy(proveedores.nombreProveedor);

    res.json({
    success: true,
    count: proveedoresActivos.length,
    data: proveedoresActivos
    });

} catch (error) {
    res.status(500).json({
    success: false,
    message: 'Error al obtener proveedores activos',
    error: error.message
    });
}
};

// ✅ Obtener estadísticas de proveedores
export const obtenerEstadisticasProveedores = async (req, res, db) => {
try {
    const estadisticas = await db
    .select({
        totalProveedores: sql`COUNT(*)`,
        proveedoresActivos: sql`COUNT(*) FILTER (WHERE ${proveedores.activo} = true)`,
        proveedoresInactivos: sql`COUNT(*) FILTER (WHERE ${proveedores.activo} = false)`
    })
    .from(proveedores);

    res.json({
    success: true,
    data: estadisticas[0]
    });

} catch (error) {
    res.status(500).json({
success: false,
message: 'Error al obtener estadísticas de proveedores',
error: error.message
    });
}
};