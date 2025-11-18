import { pgTable, serial, varchar, text, boolean, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pacientes, medicos } from './medical';
import { productos } from './products';
import { lotes } from './products';
import { usuarios } from './auth';

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
  createdAt: timestamp('created_at').defaultNow(),
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
  posologia: text('posologia'),
});

// Tabla de Dispensación
export const dispensaciones = pgTable('dispensaciones', {
  idDispensacion: serial('id_dispensacion').primaryKey(),
  idDetalleReceta: integer('id_detalle_receta').references(() => detallesReceta.idDetalle),
  idLote: integer('id_lote').references(() => lotes.idLote),
  cantidadDispensada: integer('cantidad_dispensada').notNull(),
  fechaDispensacion: timestamp('fecha_dispensacion').defaultNow(),
  dispensadoPor: integer('dispensado_por').references(() => usuarios.idUsuario),
  observaciones: text('observaciones'),
});

// Relaciones de recetas
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
  usuario: one(usuarios, {
    fields: [dispensaciones.dispensadoPor],
    references: [usuarios.idUsuario],
  }),
}));