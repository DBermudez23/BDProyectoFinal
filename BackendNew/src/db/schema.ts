// src/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  decimal,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Usuarios y roles (autenticación)
export const usuarios = pgTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  idRol: integer('id_rol'), // Puedes referenciar roles si creas la tabla, o dejarlo como entero
  tipoDocumento: varchar('tipo_documento', { length: 10 }).notNull(),
  numeroDocumento: varchar('numero_documento', { length: 20 }).notNull().unique(),
  primerNombre: varchar('primer_nombre', { length: 50 }).notNull(),
  segundoNombre: varchar('segundo_nombre', { length: 50 }),
  primerApellido: varchar('primer_apellido', { length: 50 }).notNull(),
  segundoApellido: varchar('segundo_apellido', { length: 50 }),
  email: varchar('email', { length: 100 }).unique(),
  telefono: varchar('telefono', { length: 15 }),
  fechaNacimiento: varchar('fecha_nacimiento'),
  genero: varchar('genero', { length: 25 }),
  direccion: varchar('direccion', { length: 100 }),
  ciudad: varchar('ciudad', { length: 50 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pacientes
export const pacientes = pgTable('pacientes', {
  idPaciente: serial('id_paciente').primaryKey(),
  idUsuario: integer('id_usuario')
    .references(() => usuarios.idUsuario)
    .unique()
    .notNull(),
  tipoSangre: varchar('tipo_sangre', { length: 5 }),
  alergias: text('alergias'),
  condicionesMedicas: text('condiciones_medicas'),
  contactoEmergenciaNombre: varchar('contacto_emergencia_nombre', { length: 100 }),
  contactoEmergenciaTelefono: varchar('contacto_emergencia_telefono', { length: 15 }),
  estadoCivil: varchar('estado_civil', { length: 20 }),
  ocupacion: varchar('ocupacion', { length: 100 }),
});

// Médicos
export const medicos = pgTable('medicos', {
  idMedico: serial('id_medico').primaryKey(),
  idUsuario: integer('id_usuario')
    .references(() => usuarios.idUsuario)
    .unique(),
  especialidadPrincipal: varchar('especialidad_principal', { length: 100 }).notNull(),
  registroMedico: varchar('registro_medico', { length: 50 }).notNull().unique(),
  universidad: varchar('universidad', { length: 100 }),
  anioGraduacion: integer('anio_graduacion'),
  estadoActivo: boolean('estado_activo').default(true),
});

// Especialidades
export const especialidades = pgTable('especialidades', {
  idEspecialidad: serial('id_especialidad').primaryKey(),
  nombreEspecialidad: varchar('nombre_especialidad', { length: 100 }).notNull().unique(),
  descripcion: text('descripcion'),
});

// Tabla puente médicos-especialidades
export const medicosEspecialidades = pgTable(
  'medicos_especialidades',
  {
    idMedico: integer('id_medico')
      .notNull()
      .references(() => medicos.idMedico),
    idEspecialidad: integer('id_especialidad')
      .notNull()
      .references(() => especialidades.idEspecialidad),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idMedico, table.idEspecialidad] }),
  })
);

// Recetas y detalles
export const recetas = pgTable('recetas', {
  idReceta: serial('id_receta').primaryKey(),
  idPaciente: integer('id_paciente')
    .notNull()
    .references(() => pacientes.idPaciente),
  idMedico: integer('id_medico')
    .notNull()
    .references(() => medicos.idMedico),
  codigoReceta: varchar('codigo_receta', { length: 20 }).notNull().unique(),
  fechaPrescripcion: timestamp('fecha_prescripcion').defaultNow(),
  diagnosticoPrincipal: text('diagnostico_principal').notNull(),
  instruccionesGenerales: text('instrucciones_generales'),
  estado: varchar('estado', { length: 20 }).default('Activa'),
  validada: boolean('validada').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const detallesReceta = pgTable('detalles_receta', {
  idDetalle: serial('id_detalle').primaryKey(),
  idReceta: integer('id_receta')
    .notNull()
    .references(() => recetas.idReceta),
  idProducto: integer('id_producto')
    .notNull()
    .references(() => productos.idProducto),
  dosis: varchar('dosis', { length: 100 }).notNull(),
  frecuencia: varchar('frecuencia', { length: 100 }).notNull(),
  viaAdministracion: varchar('via_administracion', { length: 50 }),
  duracionTratamiento: varchar('duracion_tratamiento', { length: 50 }),
  cantidadPrescrita: integer('cantidad_prescrita').notNull(),
  observaciones: text('observaciones'),
  posologia: text('posologia'),
});

// Dispensaciones
export const dispensaciones = pgTable('dispensaciones', {
  idDispensacion: serial('id_dispensacion').primaryKey(),
  idDetalleReceta: integer('id_detalle_receta')
    .notNull()
    .references(() => detallesReceta.idDetalle),
  idLote: integer('id_lote')
    .notNull()
    .references(() => lotes.idLote),
  cantidadDispensada: integer('cantidad_dispensada').notNull(),
  fechaDispensacion: timestamp('fecha_dispensacion').defaultNow(),
  dispensadoPor: integer('dispensado_por')
    .notNull()
    .references(() => usuarios.idUsuario),
  observaciones: text('observaciones'),
});

// Productos / Medicamentos
export const laboratorios = pgTable('laboratorios', {
  idLaboratorio: serial('id_laboratorio').primaryKey(),
  nombreLaboratorio: varchar('nombre_laboratorio', { length: 100 }).notNull().unique(),
  direccion: text('direccion'),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  activo: boolean('activo').default(true),
});

export const proveedores = pgTable('proveedores', {
  idProveedor: serial('id_proveedor').primaryKey(),
  nombreProveedor: varchar('nombre_proveedor', { length: 100 }).notNull().unique(),
  contactoNombre: varchar('contacto_nombre', { length: 100 }),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  activo: boolean('activo').default(true),
});

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
  activo: boolean('activo').default(true),
});

export const lotes = pgTable('lotes', {
  idLote: serial('id_lote').primaryKey(),
  idProducto: integer('id_producto')
    .notNull()
    .references(() => productos.idProducto),
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
  createdAt: timestamp('created_at').defaultNow(),
});

// RELACIONES 

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  paciente: one(pacientes, {
    fields: [usuarios.idUsuario],
    references: [pacientes.idUsuario],
  }),
  medico: one(medicos, {
    fields: [usuarios.idUsuario],
    references: [medicos.idUsuario],
  }),
  dispensaciones: many(dispensaciones),
}));

export const pacientesRelations = relations(pacientes, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [pacientes.idUsuario],
    references: [usuarios.idUsuario],
  }),
  recetas: many(recetas),
}));

export const medicosRelations = relations(medicos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [medicos.idUsuario],
    references: [usuarios.idUsuario],
  }),
  especialidades: many(medicosEspecialidades),
  recetas: many(recetas),
}));

export const especialidadesRelations = relations(especialidades, ({ many }) => ({
  medicos: many(medicosEspecialidades),
}));

export const medicosEspecialidadesRelations = relations(medicosEspecialidades, ({ one }) => ({
  medico: one(medicos, {
    fields: [medicosEspecialidades.idMedico],
    references: [medicos.idMedico],
  }),
  especialidad: one(especialidades, {
    fields: [medicosEspecialidades.idEspecialidad],
    references: [especialidades.idEspecialidad],
  }),
}));

export const recetasRelations = relations(recetas, ({ one, many }) => ({
  paciente: one(pacientes, {
    fields: [recetas.idPaciente],
    references: [pacientes.idPaciente],
  }),
  medico: one(medicos, {
    fields: [recetas.idMedico],
    references: [medicos.idMedico],
  }),
  detalles: many(detallesReceta),
}));

export const detallesRecetaRelations = relations(detallesReceta, ({ one, many }) => ({
  receta: one(recetas, {
    fields: [detallesReceta.idReceta],
    references: [recetas.idReceta],
  }),
  producto: one(productos, {
    fields: [detallesReceta.idProducto],
    references: [productos.idProducto],
  }),
  dispensaciones: many(dispensaciones),
}));

export const dispensacionesRelations = relations(dispensaciones, ({ one }) => ({
  detalleReceta: one(detallesReceta, {
    fields: [dispensaciones.idDetalleReceta],
    references: [detallesReceta.idDetalle],
  }),
  lote: one(lotes, {
    fields: [dispensaciones.idLote],
    references: [lotes.idLote],
  }),
  dispensadoPor: one(usuarios, {
    fields: [dispensaciones.dispensadoPor],
    references: [usuarios.idUsuario],
  }),
}));

export const productosRelations = relations(productos, ({ one, many }) => ({
  laboratorio: one(laboratorios, {
    fields: [productos.idLaboratorio],
    references: [laboratorios.idLaboratorio],
  }),
  lotes: many(lotes),
  detallesReceta: many(detallesReceta),
}));

export const lotesRelations = relations(lotes, ({ one, many }) => ({
  producto: one(productos, {
    fields: [lotes.idProducto],
    references: [productos.idProducto],
  }),
  proveedor: one(proveedores, {
    fields: [lotes.idProveedor],
    references: [proveedores.idProveedor],
  }),
  dispensaciones: many(dispensaciones),
}));

export const laboratoriosRelations = relations(laboratorios, ({ many }) => ({
  productos: many(productos),
}));

export const proveedoresRelations = relations(proveedores, ({ many }) => ({
  lotes: many(lotes),
}));