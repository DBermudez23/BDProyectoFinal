import { eq, desc, like, and, or } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { medicos, usuarios } = schema;

// Obtener todos los médicos (con datos de usuario) y búsqueda opcional
async function getAllMedicos(req, res) {
	try {
		const { buscar = '' } = req.query;
		const whereConditions = [];
		if (buscar) {
			whereConditions.push(
				or(
					like(usuarios.primerNombre, `%${buscar}%`),
					like(usuarios.primerApellido, `%${buscar}%`),
					like(medicos.registroMedico, `%${buscar}%`),
					like(medicos.especialidadPrincipal, `%${buscar}%`)
				)
			);
		}

		const rows = await db
			.select({
				idMedico: medicos.idMedico,
				especialidadPrincipal: medicos.especialidadPrincipal,
				registroMedico: medicos.registroMedico,
				universidad: medicos.universidad,
				anioGraduacion: medicos.anioGraduacion,
				estadoActivo: medicos.estadoActivo,
				// usuario
				idUsuario: usuarios.idUsuario,
				numeroDocumento: usuarios.numeroDocumento,
				primerNombre: usuarios.primerNombre,
				segundoNombre: usuarios.segundoNombre,
				primerApellido: usuarios.primerApellido,
				segundoApellido: usuarios.segundoApellido,
				email: usuarios.email,
				telefono: usuarios.telefono,
				ciudad: usuarios.ciudad,
			})
			.from(medicos)
			.innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
			.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
			.orderBy(desc(usuarios.createdAt));

		return res.status(200).json({ success: true, data: rows, total: rows.length });
	} catch (error) {
		console.error('getAllMedicos error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener médicos' });
	}
}

// Obtener médico por id con datos de usuario
async function getMedicoById(req, res) {
	const id = Number(req.params.id);
	if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
	try {
		const rows = await db
			.select({
				idMedico: medicos.idMedico,
				especialidadPrincipal: medicos.especialidadPrincipal,
				registroMedico: medicos.registroMedico,
				universidad: medicos.universidad,
				anioGraduacion: medicos.anioGraduacion,
				estadoActivo: medicos.estadoActivo,
				idUsuario: usuarios.idUsuario,
				numeroDocumento: usuarios.numeroDocumento,
				primerNombre: usuarios.primerNombre,
				segundoNombre: usuarios.segundoNombre,
				primerApellido: usuarios.primerApellido,
				segundoApellido: usuarios.segundoApellido,
				email: usuarios.email,
				telefono: usuarios.telefono,
				ciudad: usuarios.ciudad,
			})
			.from(medicos)
			.innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
			.where(eq(medicos.idMedico, id))
			.limit(1);

		if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Médico no encontrado' });
		return res.status(200).json({ success: true, data: rows[0] });
	} catch (error) {
		console.error('getMedicoById error:', error);
		return res.status(500).json({ success: false, message: 'Error al obtener médico' });
	}
}

// Crear médico con transacción: crear usuario + médico
async function createMedico(req, res) {
  try {
    const {
      tipoDocumento,
      numeroDocumento,
      primerNombre,
      segundoNombre = null,
      primerApellido,
      segundoApellido = null,
      email = null,
      telefono = null,
      fechaNacimiento = null,
      genero = null,
      direccion = null,
      ciudad = null,
      passwordHash = null,
      especialidadPrincipal,
      registroMedico,
      universidad = null,
      anioGraduacion = null,
      estadoActivo = true,
    } = req.body;

    // Validaciones
    if (!tipoDocumento || !numeroDocumento || !primerNombre || !primerApellido || !registroMedico || !especialidadPrincipal) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    // Verificar duplicados
    const usuarioExistente = await db.select().from(usuarios).where(eq(usuarios.numeroDocumento, numeroDocumento)).limit(1);
    if (usuarioExistente.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con este documento' });
    }

    const medicoExistente = await db.select().from(medicos).where(eq(medicos.registroMedico, registroMedico)).limit(1);
    if (medicoExistente.length > 0) {
      return res.status(409).json({ success: false, message: 'Este registro médico ya existe' });
    }

    // TRANSACCIÓN CORREGIDA
    const result = await db.transaction(async (tx) => {
      // 1. Crear usuario y obtener TODOS los campos (no solo id)
      const nuevoUsuarioArr = await tx.insert(usuarios).values({
        idRol: 2,
        tipoDocumento,
        numeroDocumento,
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        email,
        telefono,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        genero,
        direccion,
        ciudad,
        passwordHash: passwordHash || 'temp123',
        activo: true,
      }).returning(); // <-- SIN alias, devuelve todo

      const nuevoUsuario = nuevoUsuarioArr[0];
      const idUsuario = nuevoUsuario.idUsuario || nuevoUsuario.id_usuario;

      if (!idUsuario) {
        throw new Error('No se pudo obtener el idUsuario después de insertar');
      }

      // 2. Crear médico con el ID correcto
      const nuevoMedicoArr = await tx.insert(medicos).values({
        idUsuario, // ¡AQUÍ SÍ LLEGA EL ID!
        especialidadPrincipal,
        registroMedico,
        universidad,
        anioGraduacion,
        estadoActivo,
      }).returning();

      const nuevoMedico = nuevoMedicoArr[0];

      // 3. Devolver médico completo con datos del usuario
      const medicoCompleto = await tx
        .select({
          idMedico: medicos.idMedico,
          especialidadPrincipal: medicos.especialidadPrincipal,
          registroMedico: medicos.registroMedico,
          universidad: medicos.universidad,
          anioGraduacion: medicos.anioGraduacion,
          estadoActivo: medicos.estadoActivo,
          // Datos del usuario
          idUsuario: usuarios.idUsuario,
          numeroDocumento: usuarios.numeroDocumento,
          primerNombre: usuarios.primerNombre,
          segundoNombre: usuarios.segundoNombre,
          primerApellido: usuarios.primerApellido,
          segundoApellido: usuarios.segundoApellido,
          email: usuarios.email,
          telefono: usuarios.telefono,
        })
        .from(medicos)
        .innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
        .where(eq(medicos.idMedico, nuevoMedico.idMedico))
        .limit(1);

      return { medico: medicoCompleto[0] };
    });

    return res.status(201).json({
      success: true,
      message: 'Médico creado exitosamente',
      data: result.medico
    });

  } catch (error) {
    console.error('createMedico error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear médico',
      detalles: error.message
    });
  }
}

// Actualizar médico (transacción: actualizar usuario y datos de médico)
async function updateMedico(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

		const {
			// usuario
			telefono,
			email,
			direccion,
			ciudad,
			activo,
			// medico
			especialidadPrincipal,
			universidad,
			anioGraduacion,
			estadoActivo,
		} = req.body || {};

		const medicoExistente = await db.select({ idMedico: medicos.idMedico, idUsuario: medicos.idUsuario }).from(medicos).where(eq(medicos.idMedico, id)).limit(1);
		if (!medicoExistente || medicoExistente.length === 0) return res.status(404).json({ success: false, message: 'Médico no encontrado' });

		const medico = medicoExistente[0];

		await db.transaction(async (tx) => {
			if (telefono || email || direccion || ciudad || activo !== undefined) {
				await tx.update(usuarios).set({
					...(telefono && { telefono }),
					...(email && { email }),
					...(direccion && { direccion }),
					...(ciudad && { ciudad }),
					...(activo !== undefined && { activo }),
					updatedAt: new Date(),
				}).where(eq(usuarios.idUsuario, medico.idUsuario));
			}

			await tx.update(medicos).set({
				...(especialidadPrincipal !== undefined && { especialidadPrincipal }),
				...(universidad !== undefined && { universidad }),
				...(anioGraduacion !== undefined && { anioGraduacion }),
				...(estadoActivo !== undefined && { estadoActivo }),
			}).where(eq(medicos.idMedico, id));
		});

		const medicoActualizado = await db
			.select({
				idMedico: medicos.idMedico,
				especialidadPrincipal: medicos.especialidadPrincipal,
				registroMedico: medicos.registroMedico,
				universidad: medicos.universidad,
				anioGraduacion: medicos.anioGraduacion,
				estadoActivo: medicos.estadoActivo,
				idUsuario: usuarios.idUsuario,
				primerNombre: usuarios.primerNombre,
				primerApellido: usuarios.primerApellido,
				email: usuarios.email,
				telefono: usuarios.telefono,
			})
			.from(medicos)
			.innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
			.where(eq(medicos.idMedico, id))
			.limit(1);

		return res.status(200).json({ success: true, message: 'Médico actualizado', data: medicoActualizado[0] });
	} catch (error) {
		console.error('updateMedico error:', error);
		return res.status(500).json({ success: false, message: 'Error al actualizar médico' });
	}
}

// Eliminación lógica del médico: desactivar usuario y marcar estado del médico
async function deleteMedico(req, res) {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

		const medicoExistente = await db.select({ idMedico: medicos.idMedico, idUsuario: medicos.idUsuario }).from(medicos).where(eq(medicos.idMedico, id)).limit(1);
		if (!medicoExistente || medicoExistente.length === 0) return res.status(404).json({ success: false, message: 'Médico no encontrado' });

		const { idUsuario } = medicoExistente[0];

		await db.transaction(async (tx) => {
			await tx.update(usuarios).set({ activo: false, updatedAt: new Date() }).where(eq(usuarios.idUsuario, idUsuario));
			await tx.update(medicos).set({ estadoActivo: false }).where(eq(medicos.idMedico, id));
		});

		return res.status(200).json({ success: true, message: 'Médico desactivado', idUsuario });
	} catch (error) {
		console.error('deleteMedico error:', error);
		return res.status(500).json({ success: false, message: 'Error al eliminar médico' });
	}
}

export { getAllMedicos, getMedicoById, createMedico, updateMedico, deleteMedico };

