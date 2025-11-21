import { db } from "../db/drizzle.js";
import { pacientes, usuarios } from "../db/schema.js";
import { eq, desc, like, and, or } from "drizzle-orm";

// API para obtener todos los pacientes con información de usuario
const obtenerPacientes = async (req, res) => {
    try {
        const { buscar = '' } = req.query;

        // Construir condiciones de búsqueda
        const whereConditions = [];
        
        if (buscar) {
            whereConditions.push(
                or(
                    like(usuarios.primerNombre, `%${buscar}%`),
                    like(usuarios.primerApellido, `%${buscar}%`),
                    like(usuarios.numeroDocumento, `%${buscar}%`)
                )
            );
        }

        // Obtener TODOS los pacientes
        const pacientesData = await db
            .select({
                idPaciente: pacientes.idPaciente,
                tipoSangre: pacientes.tipoSangre,
                alergias: pacientes.alergias,
                condicionesMedicas: pacientes.condicionesMedicas,
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
            .from(pacientes)
            .innerJoin(usuarios, eq(pacientes.idUsuario, usuarios.idUsuario))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(desc(usuarios.createdAt));

        res.status(200).json({
            success: true,
            data: pacientesData,
            total: pacientesData.length
        });

    } catch (error) {
        console.error("Error obteniendo pacientes:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener pacientes"
        });
    }
};

// Obtener un paciente específico por ID
const obtenerPacientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pacienteData = await db
            .select({
                // Datos de la tabla pacientes
                idPaciente: pacientes.idPaciente,
                tipoSangre: pacientes.tipoSangre,
                alergias: pacientes.alergias,
                condicionesMedicas: pacientes.condicionesMedicas,
                contactoEmergenciaNombre: pacientes.contactoEmergenciaNombre,
                contactoEmergenciaTelefono: pacientes.contactoEmergenciaTelefono,
                estadoCivil: pacientes.estadoCivil,
                ocupacion: pacientes.ocupacion,
                // Datos de la tabla usuarios
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
            .from(pacientes)
            .innerJoin(usuarios, eq(pacientes.idUsuario, usuarios.idUsuario))
            .where(eq(pacientes.idPaciente, parseInt(id)))
            .limit(1);

        if (pacienteData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Paciente no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            data: pacienteData[0]
        });

    } catch (error) {
        console.error("Error obteniendo paciente:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener el paciente"
        });
    }
};

// Crear un nuevo paciente
const crearPaciente = async (req, res) => {
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
            idRol = 3, // Rol de paciente por defecto

            // Datos específicos del paciente
            tipoSangre = null,
            alergias = null,
            condicionesMedicas = null,
            contactoEmergenciaNombre = null,
            contactoEmergenciaTelefono = null,
            estadoCivil = null,
            ocupacion = null
        } = req.body;

        // Validaciones básicas
        if (!tipoDocumento || !numeroDocumento || !primerNombre || !primerApellido) {
            return res.status(400).json({
                success: false,
                message: "Los campos tipoDocumento, numeroDocumento, primerNombre y primerApellido son obligatorios"
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

        // Transacción para crear usuario y paciente
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

            // 2. Crear el paciente asociado
            const [nuevoPaciente] = await tx.insert(pacientes).values({
                idUsuario: nuevoUsuario.idUsuario,
                tipoSangre,
                alergias,
                condicionesMedicas,
                contactoEmergenciaNombre,
                contactoEmergenciaTelefono,
                estadoCivil,
                ocupacion
            }).returning();

            return { usuario: nuevoUsuario, paciente: nuevoPaciente };
        });

        res.status(201).json({
            success: true,
            message: "Paciente creado exitosamente",
            data: result.paciente
        });

    } catch (error) {
        console.error("Error creando paciente:", error);

        if (error.code === '23505') { // Violación de unique constraint
            return res.status(409).json({
                success: false,
                message: "El número de documento ya existe en el sistema"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el paciente"
        });
    }
};

// Actualizar un paciente existente
const actualizarPaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            // Datos de usuario actualizables
            telefono,
            email,
            direccion,
            ciudad,
            activo,

            // Datos específicos del paciente
            tipoSangre,
            alergias,
            condicionesMedicas,
            contactoEmergenciaNombre,
            contactoEmergenciaTelefono,
            estadoCivil,
            ocupacion
        } = req.body;

        // Verificar que el paciente existe
        const pacienteExistente = await db
            .select()
            .from(pacientes)
            .where(eq(pacientes.idPaciente, parseInt(id)))
            .limit(1);

        if (pacienteExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Paciente no encontrado"
            });
        }

        const paciente = pacienteExistente[0];

        // Transacción para actualizar usuario y paciente
        await db.transaction(async (tx) => {
            // Actualizar datos del usuario
            if (telefono || email || direccion || ciudad || activo !== undefined) {
                await tx.update(usuarios)
                    .set({
                        ...(telefono && { telefono }),
                        ...(email && { email }),
                        ...(direccion && { direccion }),
                        ...(ciudad && { ciudad }),
                        ...(activo !== undefined && { activo }),
                        updatedAt: new Date()
                    })
                    .where(eq(usuarios.idUsuario, paciente.idUsuario));
            }

            // Actualizar datos del paciente
            await tx.update(pacientes)
                .set({
                    ...(tipoSangre !== undefined && { tipoSangre }),
                    ...(alergias !== undefined && { alergias }),
                    ...(condicionesMedicas !== undefined && { condicionesMedicas }),
                    ...(contactoEmergenciaNombre !== undefined && { contactoEmergenciaNombre }),
                    ...(contactoEmergenciaTelefono !== undefined && { contactoEmergenciaTelefono }),
                    ...(estadoCivil !== undefined && { estadoCivil }),
                    ...(ocupacion !== undefined && { ocupacion })
                })
                .where(eq(pacientes.idPaciente, parseInt(id)));
        });

        res.status(200).json({
            success: true,
            message: "Paciente actualizado exitosamente"
        });

    } catch (error) {
        console.error("Error actualizando paciente:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el paciente"
        });
    }
};

// Eliminar un paciente (eliminación lógica)
const eliminarPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el paciente existe
        const pacienteExistente = await db
            .select({
                idPaciente: pacientes.idPaciente,
                idUsuario: pacientes.idUsuario
            })
            .from(pacientes)
            .where(eq(pacientes.idPaciente, parseInt(id)))
            .limit(1);

        if (pacienteExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Paciente no encontrado"
            });
        }

        // Eliminación lógica - desactivar el usuario
        await db.update(usuarios)
            .set({
                activo: false,
                updatedAt: new Date()
            })
            .where(eq(usuarios.idUsuario, pacienteExistente[0].idUsuario));

        res.status(200).json({
            success: true,
            message: "Paciente desactivado exitosamente"
        });

    } catch (error) {
        console.error("Error eliminando paciente:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al eliminar el paciente"
        });
    }
};

// Buscar pacientes por diferentes criterios
const buscarPacientes = async (req, res) => {
    try {
        const { documento, nombre, email } = req.query;

        if (!documento && !nombre && !email) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar al menos un criterio de búsqueda (documento, nombre o email)"
            });
        }

        const whereConditions = [];

        if (documento) {
            whereConditions.push(like(usuarios.numeroDocumento, `%${documento}%`));
        }

        if (nombre) {
            whereConditions.push(
                or(
                    like(usuarios.primerNombre, `%${nombre}%`),
                    like(usuarios.primerApellido, `%${nombre}%`)
                )
            );
        }

        if (email) {
            whereConditions.push(like(usuarios.email, `%${email}%`));
        }

        const pacientesEncontrados = await db
            .select({
                idPaciente: pacientes.idPaciente,
                numeroDocumento: usuarios.numeroDocumento,
                primerNombre: usuarios.primerNombre,
                primerApellido: usuarios.primerApellido,
                email: usuarios.email,
                telefono: usuarios.telefono
            })
            .from(pacientes)
            .innerJoin(usuarios, eq(pacientes.idUsuario, usuarios.idUsuario))
            .where(and(...whereConditions))
            .limit(20);

        res.status(200).json({
            success: true,
            data: pacientesEncontrados,
            count: pacientesEncontrados.length
        });

    } catch (error) {
        console.error("Error buscando pacientes:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al buscar pacientes"
        });
    }
};

export {
    obtenerPacientes,
    obtenerPacientePorId,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente,
    buscarPacientes
};