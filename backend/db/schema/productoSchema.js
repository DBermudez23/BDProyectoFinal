import { pgTable, serial, varchar, text, boolean, timestamp, integer, decimal, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla de Laboratorios
export const laboratorios = pgTable('laboratorios', {
  idLaboratorio: serial('id_laboratorio').primaryKey(),
  nombreLaboratorio: varchar('nombre_laboratorio', { length: 100 }).notNull().unique(),
  direccion: text('direccion'),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  activo: boolean('activo').default(true),
});

// Tabla de Proveedores
export const proveedores = pgTable('proveedores', {
  idProveedor: serial('id_proveedor').primaryKey(),
  nombreProveedor: varchar('nombre_proveedor', { length: 100 }).notNull().unique(),
  contactoNombre: varchar('contacto_nombre', { length: 100 }),
  telefono: varchar('telefono', { length: 15 }),
  email: varchar('email', { length: 100 }),
  direccion: text('direccion'),
  activo: boolean('activo').default(true),
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
  activo: boolean('activo').default(true),
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
  createdAt: timestamp('created_at').defaultNow(),
});

// Relaciones de productos
export const laboratoriosRelations = relations(laboratorios, ({ many }) => ({
  productos: many(productos),
}));

export const proveedoresRelations = relations(proveedores, ({ many }) => ({
  lotes: many(lotes),
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