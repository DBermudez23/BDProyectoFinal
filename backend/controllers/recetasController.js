import { recetas, detallesReceta, dispensaciones } from '../db/schema/prescripciones.js';
import { pacientes, medicos } from '../db/schema/medical.js';
import { productos } from '../db/schema/products.js';
import { lotes } from '../db/schema/products.js';
import { usuarios } from '../db/schema/auth.js';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';

// ✅ Obtener todas las recetas con información completa
export const obtenerRecetas = async (req, res, db) => {
  try {
    const allRecetas = await db
      .select({
        idReceta: recetas.idReceta,
        idPaciente: recetas.idPaciente,
        idMedico: recetas.idMedico,
        codigoReceta: recetas.codigoReceta,
        fechaPrescripcion: recetas.fechaPrescripcion,
        diagnosticoPrincipal: recetas.diagnosticoPrincipal,
        instruccionesGenerales: recetas.instruccionesGenerales,
        estado: recetas.estado,
        validada: recetas.validada,
        createdAt: recetas.createdAt,
        paciente: {
          primerNombre: pacientes.primerNombre,
          primerApellido: pacientes.primerApellido,
          numeroDocumento: pacientes.numeroDocumento
        },
        medico: {
          primerNombre: medicos.primerNombre,
          primerApellido: medicos.primerApellido,
          especialidadPrincipal: medicos.especialidadPrincipal
        }
      })
      .from(recetas)
      .leftJoin(pacientes, eq(recetas.idPaciente, pacientes.idPaciente))
      .leftJoin(medicos, eq(recetas.idMedico, medicos.idMedico))
      .orderBy(desc(recetas.createdAt));

    res.json({
      success: true,
      count: allRecetas.length,
      data: allRecetas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas',
      error: error.message
    });
  }
};

// ✅ Obtener una receta por ID con detalles completos
export const obtenerRecetaPorId = async (req, res, db) => {
  try {
    const { id } = req.params;

    // Obtener información básica de la receta
    const receta = await db
      .select({
        idReceta: recetas.idReceta,
        idPaciente: recetas.idPaciente,
        idMedico: recetas.idMedico,
        codigoReceta: recetas.codigoReceta,
        fechaPrescripcion: recetas.fechaPrescripcion,
        diagnosticoPrincipal: recetas.diagnosticoPrincipal,
        instruccionesGenerales: recetas.instruccionesGenerales,
        estado: recetas.estado,
        validada: recetas.validada,
        createdAt: recetas.createdAt,
        paciente: {
          idPaciente: pacientes.idPaciente,
          primerNombre: pacientes.primerNombre,
          segundoNombre: pacientes.segundoNombre,
          primerApellido: pacientes.primerApellido,
          segundoApellido: pacientes.segundoApellido,
          numeroDocumento: pacientes.numeroDocumento
        },
        medico: {
          idMedico: medicos.idMedico,
          primerNombre: medicos.primerNombre,
          segundoNombre: medicos.segundoNombre,
          primerApellido: medicos.primerApellido,
          segundoApellido: medicos.segundoApellido,
          especialidadPrincipal: medicos.especialidadPrincipal,
          registroMedico: medicos.registroMedico
        }
      })
      .from(recetas)
      .leftJoin(pacientes, eq(recetas.idPaciente, pacientes.idPaciente))
      .leftJoin(medicos, eq(recetas.idMedico, medicos.idMedico))
      .where(eq(recetas.idReceta, parseInt(id)));

    if (receta.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Obtener detalles de la receta
    const detalles = await db
      .select({
        idDetalle: detallesReceta.idDetalle,
        idProducto: detallesReceta.idProducto,
        dosis: detallesReceta.dosis,
        frecuencia: detallesReceta.frecuencia,
        viaAdministracion: detallesReceta.viaAdministracion,
        duracionTratamiento: detallesReceta.duracionTratamiento,
        cantidadPrescrita: detallesReceta.cantidadPrescrita,
        observaciones: detallesReceta.observaciones,
        posologia: detallesReceta.posologia,
        producto: {
          nombreComercial: productos.nombreComercial,
          nombreGenerico: productos.nombreGenerico,
          concentracion: productos.concentracion,
          formaFarmaceutica: productos.formaFarmaceutica
        }
      })
      .from(detallesReceta)
      .leftJoin(productos, eq(detallesReceta.idProducto, productos.idProducto))
      .where(eq(detallesReceta.idReceta, parseInt(id)));

    // Combinar información
    const recetaCompleta = {
      ...receta[0],
      detalles: detalles
    };

    res.json({
      success: true,
      data: recetaCompleta
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la receta',
      error: error.message
    });
  }
};

// ✅ Crear nueva receta con detalles
export const crearReceta = async (req, res, db) => {
  try {
    const {
      idPaciente,
      idMedico,
      codigoReceta,
      diagnosticoPrincipal,
      instruccionesGenerales,
      detalles
    } = req.body;

    // Validaciones
    if (!idPaciente || !idMedico || !codigoReceta || !diagnosticoPrincipal) {
      return res.status(400).json({
        success: false,
        message: 'Paciente, médico, código de receta y diagnóstico son obligatorios'
      });
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La receta debe tener al menos un detalle de medicamento'
      });
    }

    // Verificar si el código de receta ya existe
    const recetaExistente = await db
      .select()
      .from(recetas)
      .where(eq(recetas.codigoReceta, codigoReceta));

    if (recetaExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El código de receta ya existe'
      });
    }

    // Crear receta
    const nuevaReceta = await db
      .insert(recetas)
      .values({
        idPaciente: parseInt(idPaciente),
        idMedico: parseInt(idMedico),
        codigoReceta,
        diagnosticoPrincipal,
        instruccionesGenerales: instruccionesGenerales || null,
        estado: 'Activa',
        validada: false
      })
      .returning();

    // Crear detalles de la receta
    const detallesCreados = [];
    for (const detalle of detalles) {
      const nuevoDetalle = await db
        .insert(detallesReceta)
        .values({
          idReceta: nuevaReceta[0].idReceta,
          idProducto: parseInt(detalle.idProducto),
          dosis: detalle.dosis,
          frecuencia: detalle.frecuencia,
          viaAdministracion: detalle.viaAdministracion || null,
          duracionTratamiento: detalle.duracionTratamiento || null,
          cantidadPrescrita: parseInt(detalle.cantidadPrescrita),
          observaciones: detalle.observaciones || null,
          posologia: detalle.posologia || null
        })
        .returning();
      
      detallesCreados.push(nuevoDetalle[0]);
    }

    res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      data: {
        receta: nuevaReceta[0],
        detalles: detallesCreados
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear receta',
      error: error.message
    });
  }
};

// ✅ Actualizar receta
export const actualizarReceta = async (req, res, db) => {
  try {
    const { id } = req.params;
    const {
      diagnosticoPrincipal,
      instruccionesGenerales,
      estado,
      validada
    } = req.body;

    // Verificar si la receta existe
    const recetaExistente = await db
      .select()
      .from(recetas)
      .where(eq(recetas.idReceta, parseInt(id)));

    if (recetaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Preparar campos a actualizar
    const camposActualizar = {};
    if (diagnosticoPrincipal) camposActualizar.diagnosticoPrincipal = diagnosticoPrincipal;
    if (instruccionesGenerales !== undefined) camposActualizar.instruccionesGenerales = instruccionesGenerales;
    if (estado) camposActualizar.estado = estado;
    if (validada !== undefined) camposActualizar.validada = validada;

    // Actualizar receta
    const recetaActualizada = await db
      .update(recetas)
      .set(camposActualizar)
      .where(eq(recetas.idReceta, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: 'Receta actualizada exitosamente',
      data: recetaActualizada[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar receta',
      error: error.message
    });
  }
};

// ✅ Validar receta
export const validarReceta = async (req, res, db) => {
  try {
    const { id } = req.params;

    const recetaValidada = await db
      .update(recetas)
      .set({ 
        validada: true,
        estado: 'Validada'
      })
      .where(eq(recetas.idReceta, parseInt(id)))
      .returning();

    if (recetaValidada.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Receta validada exitosamente',
      data: recetaValidada[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al validar receta',
      error: error.message
    });
  }
};

// ✅ Obtener recetas por paciente
export const obtenerRecetasPorPaciente = async (req, res, db) => {
  try {
    const { idPaciente } = req.params;

    const recetasPaciente = await db
      .select({
        idReceta: recetas.idReceta,
        codigoReceta: recetas.codigoReceta,
        fechaPrescripcion: recetas.fechaPrescripcion,
        diagnosticoPrincipal: recetas.diagnosticoPrincipal,
        estado: recetas.estado,
        validada: recetas.validada,
        medico: {
          primerNombre: medicos.primerNombre,
          primerApellido: medicos.primerApellido,
          especialidadPrincipal: medicos.especialidadPrincipal
        }
      })
      .from(recetas)
      .leftJoin(medicos, eq(recetas.idMedico, medicos.idMedico))
      .where(eq(recetas.idPaciente, parseInt(idPaciente)))
      .orderBy(desc(recetas.fechaPrescripcion));

    res.json({
      success: true,
      count: recetasPaciente.length,
      data: recetasPaciente
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas del paciente',
      error: error.message
    });
  }
};

// ✅ Obtener recetas por médico
export const obtenerRecetasPorMedico = async (req, res, db) => {
  try {
    const { idMedico } = req.params;

    const recetasMedico = await db
      .select({
        idReceta: recetas.idReceta,
        codigoReceta: recetas.codigoReceta,
        fechaPrescripcion: recetas.fechaPrescripcion,
        diagnosticoPrincipal: recetas.diagnosticoPrincipal,
        estado: recetas.estado,
        validada: recetas.validada,
        paciente: {
          primerNombre: pacientes.primerNombre,
          primerApellido: pacientes.primerApellido
        }
      })
      .from(recetas)
      .leftJoin(pacientes, eq(recetas.idPaciente, pacientes.idPaciente))
      .where(eq(recetas.idMedico, parseInt(idMedico)))
      .orderBy(desc(recetas.fechaPrescripcion));

    res.json({
      success: true,
      count: recetasMedico.length,
      data: recetasMedico
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas del médico',
      error: error.message
    });
  }
};

// ✅ Dispensar medicamento de receta
export const dispensarMedicamento = async (req, res, db) => {
  try {
    const { idDetalleReceta, idLote, cantidadDispensada, dispensadoPor, observaciones } = req.body;

    // Validaciones
    if (!idDetalleReceta || !idLote || !cantidadDispensada || !dispensadoPor) {
      return res.status(400).json({
        success: false,
        message: 'Detalle receta, lote, cantidad y usuario son obligatorios'
      });
    }

    // Verificar stock disponible
    const lote = await db
      .select()
      .from(lotes)
      .where(eq(lotes.idLote, parseInt(idLote)));

    if (lote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }

    if (lote[0].cantidadDisponible < parseInt(cantidadDispensada)) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente en el lote seleccionado'
      });
    }

    // Crear dispensación
    const nuevaDispensacion = await db
      .insert(dispensaciones)
      .values({
        idDetalleReceta: parseInt(idDetalleReceta),
        idLote: parseInt(idLote),
        cantidadDispensada: parseInt(cantidadDispensada),
        dispensadoPor: parseInt(dispensadoPor),
        observaciones: observaciones || null
      })
      .returning();

    // Actualizar stock del lote
    const nuevoStock = lote[0].cantidadDisponible - parseInt(cantidadDispensada);
    await db
      .update(lotes)
      .set({ 
        cantidadDisponible: nuevoStock,
        estado: nuevoStock === 0 ? 'Agotado' : 'Activo'
      })
      .where(eq(lotes.idLote, parseInt(idLote)));

    res.status(201).json({
      success: true,
      message: 'Medicamento dispensado exitosamente',
      data: nuevaDispensacion[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al dispensar medicamento',
      error: error.message
    });
  }
};