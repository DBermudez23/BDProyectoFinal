import { pgTable, serial, varchar, text, boolean, timestamp, integer, date, primaryKey } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  idRol: integer('id_rol').references(() => roles.idRol),
  tipoDocumento: varchar('tipo_documento', { length: 10 }).notNull(),
  numeroDocumento: varchar('numero_documento', { length: 20 }).notNull().unique(),
  primerNombre: varchar('primer_nombre', { length: 50 }).notNull(),
  segundoNombre: varchar('segundo_nombre', {length: 50}),
  primerApellido: varchar('primer_apellido', { length: 50 }).notNull(),
  segundoApellido: varchar('segundo_apellido', {length: 50}),
  email: varchar('email', { length: 100 }).unique(),
  telefono: varchar('telefono', { length: 15 }),
  fechaNacimiento: date('fecha_nacimiento'),
  genero: varchar('genero', {length:25}),
  direccion: varchar('genero', {length:100}),
  ciudad: varchar('genero', {length:25}),
  passwordHash: varchar('password_hash', { length: 255 }),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow()
});