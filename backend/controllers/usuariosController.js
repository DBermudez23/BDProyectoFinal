import { usuarios } from '../db/schema/auth.js';
import { eq, and, or, like, desc, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ✅ Obtener todos los usuarios
export const obtenerUsuarios = async (req, res, db) => {
  try {
    const allUsuarios = await db
      .select({
        idUsuario: usuarios.idUsuario,
        idRol: usuarios.idRol,
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
      .from(usuarios)
      .orderBy(desc(usuarios.createdAt));

    res.json({
      success: true,
      count: allUsuarios.length,
      data: allUsuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// ✅ Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req, res, db) => {
  try {
    const { id } = req.params;

    const usuario = await db
      .select({
        idUsuario: usuarios.idUsuario,
        idRol: usuarios.idRol,
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
      .from(usuarios)
      .where(eq(usuarios.idUsuario, parseInt(id)));

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// ✅ Crear nuevo usuario
export const crearUsuario = async (req, res, db) => {
  try {
    const {
      idRol,
      tipoDocumento,
      numeroDocumento,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      email,
      telefono,
      fechaNacimiento,
      genero,
      direccion,
      ciudad,
      password
    } = req.body;

    // Validaciones básicas
    if (!primerNombre || !primerApellido || !email || !password || !tipoDocumento || !numeroDocumento) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: nombre, apellido, email, password, tipo documento y número documento'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await db
      .select()
      .from(usuarios)
      .where(
        or(
          eq(usuarios.email, email),
          eq(usuarios.numeroDocumento, numeroDocumento)
        )
      );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email o número de documento ya está registrado'
      });
    }

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = await db
      .insert(usuarios)
      .values({
        idRol: idRol || 2, // Valor por defecto si no se especifica
        tipoDocumento,
        numeroDocumento,
        primerNombre,
        segundoNombre: segundoNombre || null,
        primerApellido,
        segundoApellido: segundoApellido || null,
        email,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento || null,
        genero: genero || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        passwordHash
      })
      .returning();

    // Generar JWT
    const token = jwt.sign(
      { 
        id: nuevoUsuario[0].idUsuario, 
        rol: nuevoUsuario[0].idRol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Excluir passwordHash de la respuesta
    const { passwordHash: _, ...usuarioSinPassword } = nuevoUsuario[0];

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      data: usuarioSinPassword
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// ✅ Actualizar usuario
export const actualizarUsuario = async (req, res, db) => {
  try {
    const { id } = req.params;
    const {
      idRol,
      tipoDocumento,
      numeroDocumento,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      email,
      telefono,
      fechaNacimiento,
      genero,
      direccion,
      ciudad,
      activo
    } = req.body;

    // Verificar si el usuario existe
    const usuarioExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.idUsuario, parseInt(id)));

    if (usuarioExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se cambia email o documento, verificar que no existan
    if (email || numeroDocumento) {
      const usuarioConDatos = await db
        .select()
        .from(usuarios)
        .where(
          and(
            or(
              email ? eq(usuarios.email, email) : undefined,
              numeroDocumento ? eq(usuarios.numeroDocumento, numeroDocumento) : undefined
            ),
            ne(usuarios.idUsuario, parseInt(id))
          )
        );

      if (usuarioConDatos.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El email o número de documento ya está en uso por otro usuario'
        });
      }
    }

    // Preparar campos a actualizar
    const camposActualizar = {};
    if (idRol !== undefined) camposActualizar.idRol = idRol;
    if (tipoDocumento) camposActualizar.tipoDocumento = tipoDocumento;
    if (numeroDocumento) camposActualizar.numeroDocumento = numeroDocumento;
    if (primerNombre) camposActualizar.primerNombre = primerNombre;
    if (segundoNombre !== undefined) camposActualizar.segundoNombre = segundoNombre;
    if (primerApellido) camposActualizar.primerApellido = primerApellido;
    if (segundoApellido !== undefined) camposActualizar.segundoApellido = segundoApellido;
    if (email) camposActualizar.email = email;
    if (telefono !== undefined) camposActualizar.telefono = telefono;
    if (fechaNacimiento !== undefined) camposActualizar.fechaNacimiento = fechaNacimiento;
    if (genero !== undefined) camposActualizar.genero = genero;
    if (direccion !== undefined) camposActualizar.direccion = direccion;
    if (ciudad !== undefined) camposActualizar.ciudad = ciudad;
    if (activo !== undefined) camposActualizar.activo = activo;

    // Actualizar usuario
    const usuarioActualizado = await db
      .update(usuarios)
      .set(camposActualizar)
      .where(eq(usuarios.idUsuario, parseInt(id)))
      .returning();

    // Excluir passwordHash de la respuesta
    const { passwordHash: _, ...usuarioSinPassword } = usuarioActualizado[0];

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioSinPassword
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// ✅ Eliminar usuario (soft delete)
export const eliminarUsuario = async (req, res, db) => {
  try {
    const { id } = req.params;

    const usuarioEliminado = await db
      .update(usuarios)
      .set({ activo: false })
      .where(eq(usuarios.idUsuario, parseInt(id)))
      .returning();

    if (usuarioEliminado.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: usuarioEliminado[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// ✅ Login de usuario
export const loginUsuario = async (req, res, db) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese email y password'
      });
    }

    // Verificar usuario incluyendo passwordHash
    const usuario = await db
      .select()
      .from(usuarios)
      .where(
        and(
          eq(usuarios.email, email),
          eq(usuarios.activo, true)
        )
      );

    if (usuario.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, usuario[0].passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuario[0].idUsuario, 
        rol: usuario[0].idRol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Excluir passwordHash de la respuesta
    const { passwordHash: _, ...usuarioSinPassword } = usuario[0];

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      data: usuarioSinPassword
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message
    });
  }
};

// ✅ Cambiar contraseña
export const cambiarPassword = async (req, res, db) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password y new password son requeridos'
      });
    }

    // Obtener usuario con passwordHash
    const usuario = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.idUsuario, parseInt(id)));

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar current password
    const isMatch = await bcrypt.compare(currentPassword, usuario[0].passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password incorrecto'
      });
    }

    // Encriptar nueva password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Actualizar password
    await db
      .update(usuarios)
      .set({ passwordHash: newPasswordHash })
      .where(eq(usuarios.idUsuario, parseInt(id)));

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

// ✅ Buscar usuarios
export const buscarUsuarios = async (req, res, db) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    const usuariosEncontrados = await db
      .select({
        idUsuario: usuarios.idUsuario,
        primerNombre: usuarios.primerNombre,
        primerApellido: usuarios.primerApellido,
        email: usuarios.email,
        numeroDocumento: usuarios.numeroDocumento,
        telefono: usuarios.telefono,
        activo: usuarios.activo
      })
      .from(usuarios)
      .where(
        or(
          like(usuarios.primerNombre, `%${query}%`),
          like(usuarios.primerApellido, `%${query}%`),
          like(usuarios.email, `%${query}%`),
          like(usuarios.numeroDocumento, `%${query}%`)
        )
      )
      .limit(20);

    res.json({
      success: true,
      count: usuariosEncontrados.length,
      data: usuariosEncontrados
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    });
  }
};