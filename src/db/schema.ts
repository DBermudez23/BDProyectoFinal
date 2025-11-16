import { pgTable, serial, varchar, text, integer, boolean, date, timestamp, decimal, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla de Roles
export const roles = pgTable('roles', {
  idRol: serial('id_rol').primaryKey(),
  nombreRol: varchar('nombre_rol', { length: 50 }).notNull().unique(),
  descripcion: text('descripcion')
});

// Tabla de Permisos
export const permisos = pgTable('permisos', {
  idPermiso: serial('id_permiso').primaryKey(),
  nombrePermiso: varchar('nombre_permiso', { length: 100 }).notNull().unique(),
  descripcion: text('descripcion')
});

// Tabla Puente: Roles-Permisos
export const rolesPermisos = pgTable('roles_permisos', {
  idRol: integer('id_rol').notNull().references(() => roles.idRol),
  idPermiso: integer('id_permiso').notNull().references(() => permisos.idPermiso)
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.idRol, table.idPermiso] })
  };
});

// Tabla de Usuarios (Médicos y Pacientes)
export const usuarios = pgTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  idRol: integer('id_rol').references(() => roles.idRol),
  tipoDocumento: varchar('tipo_documento', { length: 10 }).notNull(),
  numeroDocumento: varchar('numero_documento', { length: 20 }).notNull().unique(),
  primerNombre: varchar('primer_nombre', { length: 50 }).notNull(),
  primerApellido: varchar('primer_apellido', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique(),
  telefono: varchar('telefono', { length: 15 }),
  fechaNacimiento: date('fecha_nacimiento'),
  passwordHash: varchar('password_hash', { length: 255 }),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabla de Pacientes
export const pacientes = pgTable('pacientes', {
  idPaciente: serial('id_paciente').primaryKey(),
  idUsuario: integer('id_usuario').unique().references(() => usuarios.idUsuario),
  tipoSangre: varchar('tipo_sangre', { length: 5 }),
  alergias: text('alergias'),
  condicionesMedicas: text('condiciones_medicas'),
  contactoEmergenciaNombre: varchar('contacto_emergencia_nombre', { length: 100 }),
  contactoEmergenciaTelefono: varchar('contacto_emergencia_telefono', { length: 15 })
});

// Tabla de Médicos
export const medicos = pgTable('medicos', {
  idMedico: serial('id_medico').primaryKey(),
  idUsuario: integer('id_usuario').unique().references(() => usuarios.idUsuario),
  especialidad: varchar('especialidad', { length: 100 }).notNull(),
  registroMedico: varchar('registro_medico', { length: 50 }).notNull().unique(),
  estadoActivo: boolean('estado_activo').default(true)
});

// Tabla de Laboratorios
export const laboratorios = pgTable('laboratorios', {
  idLaboratorio: serial('id_laboratorio').primaryKey(),
  nombreLaboratorio: varchar('nombre_laboratorio', { length: 100 }).notNull().unique(),
  direccion: text('direccion'),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  activo: boolean('activo').default(true)
});

// Tabla de Proveedores
export const proveedores = pgTable('proveedores', {
  idProveedor: serial('id_proveedor').primaryKey(),
  nombreProveedor: varchar('nombre_proveedor', { length: 100 }).notNull().unique(),
  contactoNombre: varchar('contacto_nombre', { length: 100 }),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  activo: boolean('activo').default(true)
});

// Tabla de Productos/Medicamentos
export const productos = pgTable('productos', {
  idProducto: serial('id_producto').primaryKey(),
  idLaboratorio: integer('id_laboratorio').references(() => laboratorios.idLaboratorio),
  codigoProducto: varchar('codigo_producto', { length: 50 }).notNull().unique(),
  nombreComercial: varchar('nombre_comercial', { length: 100 }).notNull(),
  nombreGenerico: varchar('nombre_generico', { length: 100 }).notNull(),
  principioActivo: varchar('principio_activo', { length: 100 }),
  concentracion: varchar('concentracion', { length: 50 }),
  formaFarmaceutica: varchar('forma_farmaceutica', { length: 50 }),
  viaAdministracion: varchar('via_administracion', { length: 50 }),
  presentacion: varchar('presentacion', { length: 100 }),
  contraindicaciones: text('contraindicaciones'),
  efectosSecundarios: text('efectos_secundarios'),
  requiereFormula: boolean('requiere_formula').default(true),
  activo: boolean('activo').default(true)
});

// Tabla de Lotes
export const lotes = pgTable('lotes', {
  idLote: serial('id_lote').primaryKey(),
  idProducto: integer('id_producto').references(() => productos.idProducto),
  idProveedor: integer('id_proveedor').references(() => proveedores.idProveedor),
  numeroLote: varchar('numero_lote', { length: 50 }).notNull(),
  fechaFabricacion: date('fecha_fabricacion').notNull(),
  fechaVencimiento: date('fecha_vencimiento').notNull(),
  cantidadRecibida: integer('cantidad_recibida').notNull(),
  cantidadDisponible: integer('cantidad_disponible').notNull(),
  precioCompra: decimal('precio_compra', { precision: 10, scale: 2 }),
  precioVenta: decimal('precio_venta', { precision: 10, scale: 2 }),
  ubicacion: varchar('ubicacion', { length: 100 }),
  estado: varchar('estado', { length: 20 }).default('Activo'),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabla de Recetas
export const recetas = pgTable('recetas', {
  idReceta: serial('id_receta').primaryKey(),
  idPaciente: integer('id_paciente').references(() => pacientes.idPaciente),
  idMedico: integer('id_medico').references(() => medicos.idMedico),
  codigoReceta: varchar('codigo_receta', { length: 20 }).notNull().unique(),
  fechaPrescripcion: timestamp('fecha_prescripcion').defaultNow(),
  diagnosticoPrincipal: text('diagnostico_principal').notNull(),
  instruccionesGenerales: text('instrucciones_generales'),
  estado: varchar('estado', { length: 20 }).default('Activa'),
  validada: boolean('validada').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Tabla de Detalles de Receta
export const detallesReceta = pgTable('detalles_receta', {
  idDetalle: serial('id_detalle').primaryKey(),
  idReceta: integer('id_receta').references(() => recetas.idReceta),
  idProducto: integer('id_producto').references(() => productos.idProducto),
  dosis: varchar('dosis', { length: 100 }).notNull(),
  frecuencia: varchar('frecuencia', { length: 100 }).notNull(),
  viaAdministracion: varchar('via_administracion', { length: 50 }),
  duracionTratamiento: varchar('duracion_tratamiento', { length: 50 }),
  cantidadPrescrita: integer('cantidad_prescrita').notNull(),
  observaciones: text('observaciones'),
  posologia: text('posologia')
});

// Tabla de Dispensación
export const dispensaciones = pgTable('dispensaciones', {
  idDispensacion: serial('id_dispensacion').primaryKey(),
  idDetalleReceta: integer('id_detalle_receta').references(() => detallesReceta.idDetalle),
  idLote: integer('id_lote').references(() => lotes.idLote),
  cantidadDispensada: integer('cantidad_dispensada').notNull(),
  fechaDispensacion: timestamp('fecha_dispensacion').defaultNow(),
  dispensadoPor: integer('dispensado_por').references(() => usuarios.idUsuario),
  observaciones: text('observaciones')
});