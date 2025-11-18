import { pgTable, serial, varchar, text, boolean, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usuarios } from './auth';

// Tabla de Pacientes
export const pacientes = pgTable('pacientes', {
  idPaciente: serial('id_paciente').primaryKey(),
  idUsuario: integer('id_usuario').references(() => usuarios.idUsuario).unique(),
  tipoSangre: varchar('tipo_sangre', { length: 5 }),
  alergias: text('alergias'),
  condicionesMedicas: text('condiciones_medicas'),
  contactoEmergenciaNombre: varchar('contacto_emergencia_nombre', { length: 100 }),
  contactoEmergenciaTelefono: varchar('contacto_emergencia_telefono', { length: 15 }),
  estadoCivil: varchar('estado_civil', { length: 20 }),
  ocupacion: varchar('ocupacion', { length: 100 }),
});

// Tabla de Médicos
export const medicos = pgTable('medicos', {
  idMedico: serial('id_medico').primaryKey(),
  idUsuario: integer('id_usuario').references(() => usuarios.idUsuario).unique(),
  especialidadPrincipal: varchar('especialidad_principal', { length: 100 }).notNull(),
  registroMedico: varchar('registro_medico', { length: 50 }).notNull().unique(),
  universidad: varchar('universidad', { length: 100 }),
  anioGraduacion: integer('anio_graduacion'),
  estadoActivo: boolean('estado_activo').default(true),
});

// Tabla de Especialidades Médicas
export const especialidades = pgTable('especialidades', {
  idEspecialidad: serial('id_especialidad').primaryKey(),
  nombreEspecialidad: varchar('nombre_especialidad', { length: 100 }).notNull().unique(),
  descripcion: text('descripcion'),
});

// Tabla Puente: Médicos-Especialidades
export const medicosEspecialidades = pgTable('medicos_especialidades', {
  idMedico: integer('id_medico').references(() => medicos.idMedico),
  idEspecialidad: integer('id_especialidad').references(() => especialidades.idEspecialidad),
}, (table) => ({
  primaryKey: primaryKey({ columns: [table.idMedico, table.idEspecialidad] })
}));

// Relaciones médicas
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