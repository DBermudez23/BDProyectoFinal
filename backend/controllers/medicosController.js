import { schema } from "../db/schema/index.js";
import { eq, desc, like, and, or, inArray } from "drizzle-orm";

const {usuarios, medicosEspecialidades, especialidades} = schema

// API para obtener todos los médicos 
const obtenerMedicos = async (req, res) => {
    try {
        const { buscar = '' } = req.query;
        const whereConditions = [];
        
        if (buscar) {
            whereConditions.push(
                or(
                    like(usuarios.primerNombre, `%${buscar}%`),
                    like(usuarios.primerApellido, `%${buscar}%`),
                    like(usuarios.numeroDocumento, `%${buscar}%`),
                    like(medicos.registroMedico, `%${buscar}%`)
                )
            );
        }

        // Solo médicos activos
        whereConditions.push(eq(medicos.estadoActivo, true));

        const medicosData = await db
            .select({
                idMedico: medicos.idMedico,
                especialidadPrincipal: medicos.especialidadPrincipal,
                registroMedico: medicos.registroMedico,
                universidad: medicos.universidad,
                anioGraduacion: medicos.anioGraduacion,
                estadoActivo: medicos.estadoActivo,
                // Datos del usuario
                idUsuario: usuarios.idUsuario,
                tipoDocumento: usuarios.tipoDocumento,
                numeroDocumento: usuarios.numeroDocumento,
                primerNombre: usuarios.primerNombre,
                segundoNombre: usuarios.segundoNombre,
                primerApellido: usuarios.primerApellido,
                segundoApellido: usuarios.segundoApellido,
                email: usuarios.email,
                telefono: usuarios.telefono,
                fechaNacimiento: usuarios.fechaNacimiento,
                genero: usuarios.genero,
                direccion: usuarios.direccion,
                ciudad: usuarios.ciudad,
                activo: usuarios.activo
            })
            .from(medicos)
            .innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(usuarios.createdAt));

        res.status(200).json({
            success: true,
            data: medicosData,
            total: medicosData.length
        });
        
    } catch (error) {
        console.error("Error obteniendo Médicos:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los médicos"
        });
    }
};

// Obtener médico por ID con especialidades
const obtenerMedicoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener datos básicos del médico
        const medicoData = await db
            .select({
                idMedico: medicos.idMedico,
                especialidadPrincipal: medicos.especialidadPrincipal,
                registroMedico: medicos.registroMedico,
                universidad: medicos.universidad,
                anioGraduacion: medicos.anioGraduacion,
                estadoActivo: medicos.estadoActivo,
                // Datos del usuario
                idUsuario: usuarios.idUsuario,
                tipoDocumento: usuarios.tipoDocumento,
                numeroDocumento: usuarios.numeroDocumento,
                primerNombre: usuarios.primerNombre,
                segundoNombre: usuarios.segundoNombre,
                primerApellido: usuarios.primerApellido,
                segundoApellido: usuarios.segundoApellido,
                email: usuarios.email,
                telefono: usuarios.telefono,
                fechaNacimiento: usuarios.fechaNacimiento,
                genero: usuarios.genero,
                direccion: usuarios.direccion,
                ciudad: usuarios.ciudad,
                activo: usuarios.activo,
                createdAt: usuarios.createdAt
            })
            .from(medicos)
            .innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
            .where(eq(medicos.idMedico, parseInt(id)))
            .limit(1);

        if (medicoData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Médico no encontrado"
            });
        }

        // Obtener especialidades del médico
        const especialidadesData = await db
            .select({
                idEspecialidad: especialidades.idEspecialidad,
                nombreEspecialidad: especialidades.nombreEspecialidad,
                descripcion: especialidades.descripcion
            })
            .from(medicosEspecialidades)
            .innerJoin(especialidades, eq(medicosEspecialidades.idEspecialidad, especialidades.idEspecialidad))
            .where(eq(medicosEspecialidades.idMedico, parseInt(id)));

        const medicoCompleto = {
            ...medicoData[0],
            especialidades: especialidadesData
        };

        res.status(200).json({
            success: true,
            data: medicoCompleto
        });
        
    } catch (error) {
        console.error("Error obteniendo médico:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener información del médico"
        });
    }
};

// Crear nuevo médico
const crearMedico = async (req, res) => {
    try {
        const {
            // Datos de usuario
            tipoDocumento,
            numeroDocumento,
            primerNombre,
            segundoNombre = null,
            primerApellido,
            segundoApellido = null,
            email,
            telefono,
            fechaNacimiento,
            genero,
            direccion,
            ciudad = 'Pereira',
            passwordHash,
            idRol = 2, // Rol de médico por defecto

            // Datos específicos del médico
            especialidadPrincipal,
            registroMedico,
            universidad = null,
            anioGraduacion = null,
            estadoActivo = true,

            // Especialidades (array de IDs)
            especialidades = []
        } = req.body;

        // Validaciones básicas
        if (!tipoDocumento || !numeroDocumento || !primerNombre || !primerApellido || !especialidadPrincipal || !registroMedico) {
            return res.status(400).json({
                success: false,
                message: "Los campos tipoDocumento, numeroDocumento, primerNombre, primerApellido, especialidadPrincipal y registroMedico son obligatorios"
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await db
            .select()
            .from(usuarios)
            .where(eq(usuarios.numeroDocumento, numeroDocumento))
            .limit(1);

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un usuario con este número de documento"
            });
        }

        // Verificar si el registro médico ya existe
        const registroExistente = await db
            .select()
            .from(medicos)
            .where(eq(medicos.registroMedico, registroMedico))
            .limit(1);

        if (registroExistente.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un médico con este registro médico"
            });
        }

        // Transacción para crear usuario y médico
        const result = await db.transaction(async (tx) => {
            // 1. Crear el usuario
            const [nuevoUsuario] = await tx.insert(usuarios).values({
                idRol,
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
                passwordHash: passwordHash || 'temp_password',
                activo: true
            }).returning();

            // 2. Crear el médico asociado
            const [nuevoMedico] = await tx.insert(medicos).values({
                idUsuario: nuevoUsuario.idUsuario,
                especialidadPrincipal,
                registroMedico,
                universidad,
                anioGraduacion,
                estadoActivo
            }).returning();

            // 3. Asignar especialidades si se proporcionaron
            if (especialidades.length > 0) {
                const especialidadesValues = especialidades.map(idEspecialidad => ({
                    idMedico: nuevoMedico.idMedico,
                    idEspecialidad
                }));
                await tx.insert(medicosEspecialidades).values(especialidadesValues);
            }

            return { usuario: nuevoUsuario, medico: nuevoMedico };
        });

        res.status(201).json({
            success: true,
            message: "Médico creado exitosamente",
            data: result.medico
        });
    } catch (error) {
        console.error("Error creando médico:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el médico"
        });
    }
};

// Actualizar médico
const actualizarMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            // Datos de usuario actualizables
            email,
            telefono,
            direccion,
            ciudad,
            activo,

            // Datos específicos del médico
            especialidadPrincipal,
            registroMedico,
            universidad,
            anioGraduacion,
            estadoActivo,

            // Especialidades (array de IDs)
            especialidades
        } = req.body;

        // Verificar si el médico existe
        const medicoExistente = await db
            .select()
            .from(medicos)
            .where(eq(medicos.idMedico, parseInt(id)))
            .limit(1);

        if (medicoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Médico no encontrado"
            });
        }

        const medico = medicoExistente[0];

        // Transacción para actualizar
        await db.transaction(async (tx) => {
            // 1. Actualizar datos del usuario si se proporcionaron
            if (email || telefono || direccion || ciudad || activo !== undefined) {
                const updateUsuario = {};
                if (email) updateUsuario.email = email;
                if (telefono) updateUsuario.telefono = telefono;
                if (direccion) updateUsuario.direccion = direccion;
                if (ciudad) updateUsuario.ciudad = ciudad;
                if (activo !== undefined) updateUsuario.activo = activo;

                await tx.update(usuarios)
                    .set(updateUsuario)
                    .where(eq(usuarios.idUsuario, medico.idUsuario));
            }

            // 2. Actualizar datos del médico
            const updateMedico = {};
            if (especialidadPrincipal) updateMedico.especialidadPrincipal = especialidadPrincipal;
            if (registroMedico) updateMedico.registroMedico = registroMedico;
            if (universidad !== undefined) updateMedico.universidad = universidad;
            if (anioGraduacion !== undefined) updateMedico.anioGraduacion = anioGraduacion;
            if (estadoActivo !== undefined) updateMedico.estadoActivo = estadoActivo;

            if (Object.keys(updateMedico).length > 0) {
                await tx.update(medicos)
                    .set(updateMedico)
                    .where(eq(medicos.idMedico, parseInt(id)));
            }

            // 3. Actualizar especialidades si se proporcionaron
            if (especialidades) {
                // Eliminar especialidades actuales
                await tx.delete(medicosEspecialidades)
                    .where(eq(medicosEspecialidades.idMedico, parseInt(id)));

                // Insertar nuevas especialidades
                if (especialidades.length > 0) {
                    const especialidadesValues = especialidades.map(idEspecialidad => ({
                        idMedico: parseInt(id),
                        idEspecialidad
                    }));
                    await tx.insert(medicosEspecialidades).values(especialidadesValues);
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Médico actualizado exitosamente"
        });

    } catch (error) {
        console.error("Error actualizando médico:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el médico"
        });
    }
};

// Eliminar médico (eliminación lógica)
const eliminarMedico = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el médico existe
        const medicoExistente = await db
            .select()
            .from(medicos)
            .where(eq(medicos.idMedico, parseInt(id)))
            .limit(1);

        if (medicoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Médico no encontrado"
            });
        }

        // Eliminación lógica (desactivar)
        await db.transaction(async (tx) => {
            // Desactivar médico
            await tx.update(medicos)
                .set({ estadoActivo: false })
                .where(eq(medicos.idMedico, parseInt(id)));

            // Desactivar usuario
            await tx.update(usuarios)
                .set({ activo: false })
                .where(eq(usuarios.idUsuario, medicoExistente[0].idUsuario));
        });

        res.status(200).json({
            success: true,
            message: "Médico eliminado exitosamente"
        });

    } catch (error) {
        console.error("Error eliminando médico:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al eliminar el médico"
        });
    }
};

// Buscar médicos por especialidad
const buscarMedico = async (req, res) => {
    try {
        const { especialidad, ciudad } = req.query;

        const whereConditions = [eq(medicos.estadoActivo, true)];

        if (especialidad) {
            whereConditions.push(like(medicos.especialidadPrincipal, `%${especialidad}%`));
        }

        if (ciudad) {
            whereConditions.push(like(usuarios.ciudad, `%${ciudad}%`));
        }

        const medicosData = await db
            .select({
                idMedico: medicos.idMedico,
                especialidadPrincipal: medicos.especialidadPrincipal,
                registroMedico: medicos.registroMedico,
                universidad: medicos.universidad,
                // Datos del usuario
                idUsuario: usuarios.idUsuario,
                primerNombre: usuarios.primerNombre,
                primerApellido: usuarios.primerApellido,
                email: usuarios.email,
                telefono: usuarios.telefono,
                ciudad: usuarios.ciudad
            })
            .from(medicos)
            .innerJoin(usuarios, eq(medicos.idUsuario, usuarios.idUsuario))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(usuarios.createdAt));

        res.status(200).json({
            success: true,
            data: medicosData,
            total: medicosData.length
        });

    } catch (error) {
        console.error("Error buscando médicos:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al buscar médicos"
        });
    }
};

export {
    obtenerMedicos,
    obtenerMedicoPorId,
    crearMedico,
    actualizarMedico,
    eliminarMedico,
    buscarMedico
};