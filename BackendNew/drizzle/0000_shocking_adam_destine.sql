CREATE TABLE "detalles_receta" (
	"id_detalle" serial PRIMARY KEY NOT NULL,
	"id_receta" integer NOT NULL,
	"id_producto" integer NOT NULL,
	"dosis" varchar(100) NOT NULL,
	"frecuencia" varchar(100) NOT NULL,
	"via_administracion" varchar(50),
	"duracion_tratamiento" varchar(50),
	"cantidad_prescrita" integer NOT NULL,
	"observaciones" text,
	"posologia" text
);
--> statement-breakpoint
CREATE TABLE "dispensaciones" (
	"id_dispensacion" serial PRIMARY KEY NOT NULL,
	"id_detalle_receta" integer NOT NULL,
	"id_lote" integer NOT NULL,
	"cantidad_dispensada" integer NOT NULL,
	"fecha_dispensacion" timestamp DEFAULT now(),
	"dispensado_por" integer NOT NULL,
	"observaciones" text
);
--> statement-breakpoint
CREATE TABLE "especialidades" (
	"id_especialidad" serial PRIMARY KEY NOT NULL,
	"nombre_especialidad" varchar(100) NOT NULL,
	"descripcion" text,
	CONSTRAINT "especialidades_nombre_especialidad_unique" UNIQUE("nombre_especialidad")
);
--> statement-breakpoint
CREATE TABLE "laboratorios" (
	"id_laboratorio" serial PRIMARY KEY NOT NULL,
	"nombre_laboratorio" varchar(100) NOT NULL,
	"direccion" text,
	"telefono" varchar(15),
	"email" varchar(100),
	"activo" boolean DEFAULT true,
	CONSTRAINT "laboratorios_nombre_laboratorio_unique" UNIQUE("nombre_laboratorio")
);
--> statement-breakpoint
CREATE TABLE "lotes" (
	"id_lote" serial PRIMARY KEY NOT NULL,
	"id_producto" integer NOT NULL,
	"id_proveedor" integer,
	"numero_lote" varchar(50) NOT NULL,
	"fecha_fabricacion" date NOT NULL,
	"fecha_vencimiento" date NOT NULL,
	"cantidad_recibida" integer NOT NULL,
	"cantidad_disponible" integer NOT NULL,
	"precio_compra" numeric(10, 2),
	"precio_venta" numeric(10, 2),
	"ubicacion" varchar(100),
	"estado" varchar(20) DEFAULT 'Activo',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medicos" (
	"id_medico" serial PRIMARY KEY NOT NULL,
	"id_usuario" integer NOT NULL,
	"especialidad_principal" varchar(100) NOT NULL,
	"registro_medico" varchar(50) NOT NULL,
	"universidad" varchar(100),
	"anio_graduacion" integer,
	"estado_activo" boolean DEFAULT true,
	CONSTRAINT "medicos_id_usuario_unique" UNIQUE("id_usuario"),
	CONSTRAINT "medicos_registro_medico_unique" UNIQUE("registro_medico")
);
--> statement-breakpoint
CREATE TABLE "medicos_especialidades" (
	"id_medico" integer NOT NULL,
	"id_especialidad" integer NOT NULL,
	CONSTRAINT "medicos_especialidades_id_medico_id_especialidad_pk" PRIMARY KEY("id_medico","id_especialidad")
);
--> statement-breakpoint
CREATE TABLE "pacientes" (
	"id_paciente" serial PRIMARY KEY NOT NULL,
	"id_usuario" integer NOT NULL,
	"tipo_sangre" varchar(5),
	"alergias" text,
	"condiciones_medicas" text,
	"contacto_emergencia_nombre" varchar(100),
	"contacto_emergencia_telefono" varchar(15),
	"estado_civil" varchar(20),
	"ocupacion" varchar(100),
	CONSTRAINT "pacientes_id_usuario_unique" UNIQUE("id_usuario")
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id_producto" serial PRIMARY KEY NOT NULL,
	"id_laboratorio" integer,
	"codigo_producto" varchar(50) NOT NULL,
	"nombre_comercial" varchar(100) NOT NULL,
	"nombre_generico" varchar(100) NOT NULL,
	"principio_activo" varchar(100),
	"concentracion" varchar(50),
	"forma_farmaceutica" varchar(50),
	"via_administracion" varchar(50),
	"presentacion" varchar(100),
	"contraindicaciones" text,
	"efectos_secundarios" text,
	"requiere_formula" boolean DEFAULT true,
	"activo" boolean DEFAULT true,
	CONSTRAINT "productos_codigo_producto_unique" UNIQUE("codigo_producto")
);
--> statement-breakpoint
CREATE TABLE "proveedores" (
	"id_proveedor" serial PRIMARY KEY NOT NULL,
	"nombre_proveedor" varchar(100) NOT NULL,
	"contacto_nombre" varchar(100),
	"telefono" varchar(15),
	"email" varchar(100),
	"direccion" text,
	"activo" boolean DEFAULT true,
	CONSTRAINT "proveedores_nombre_proveedor_unique" UNIQUE("nombre_proveedor")
);
--> statement-breakpoint
CREATE TABLE "recetas" (
	"id_receta" serial PRIMARY KEY NOT NULL,
	"id_paciente" integer NOT NULL,
	"id_medico" integer NOT NULL,
	"codigo_receta" varchar(20) NOT NULL,
	"fecha_prescripcion" timestamp DEFAULT now(),
	"diagnostico_principal" text NOT NULL,
	"instrucciones_generales" text,
	"estado" varchar(20) DEFAULT 'Activa',
	"validada" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recetas_codigo_receta_unique" UNIQUE("codigo_receta")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id_usuario" serial PRIMARY KEY NOT NULL,
	"id_rol" integer,
	"tipo_documento" varchar(10) NOT NULL,
	"numero_documento" varchar(20) NOT NULL,
	"primer_nombre" varchar(50) NOT NULL,
	"segundo_nombre" varchar(50),
	"primer_apellido" varchar(50) NOT NULL,
	"segundo_apellido" varchar(50),
	"email" varchar(100),
	"telefono" varchar(15),
	"fecha_nacimiento" date,
	"genero" varchar(25),
	"direccion" varchar(100),
	"ciudad" varchar(50),
	"password_hash" varchar(255),
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_numero_documento_unique" UNIQUE("numero_documento"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "detalles_receta" ADD CONSTRAINT "detalles_receta_id_receta_recetas_id_receta_fk" FOREIGN KEY ("id_receta") REFERENCES "public"."recetas"("id_receta") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalles_receta" ADD CONSTRAINT "detalles_receta_id_producto_productos_id_producto_fk" FOREIGN KEY ("id_producto") REFERENCES "public"."productos"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensaciones" ADD CONSTRAINT "dispensaciones_id_detalle_receta_detalles_receta_id_detalle_fk" FOREIGN KEY ("id_detalle_receta") REFERENCES "public"."detalles_receta"("id_detalle") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensaciones" ADD CONSTRAINT "dispensaciones_id_lote_lotes_id_lote_fk" FOREIGN KEY ("id_lote") REFERENCES "public"."lotes"("id_lote") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensaciones" ADD CONSTRAINT "dispensaciones_dispensado_por_usuarios_id_usuario_fk" FOREIGN KEY ("dispensado_por") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_id_producto_productos_id_producto_fk" FOREIGN KEY ("id_producto") REFERENCES "public"."productos"("id_producto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_id_proveedor_proveedores_id_proveedor_fk" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedores"("id_proveedor") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicos_especialidades" ADD CONSTRAINT "medicos_especialidades_id_medico_medicos_id_medico_fk" FOREIGN KEY ("id_medico") REFERENCES "public"."medicos"("id_medico") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicos_especialidades" ADD CONSTRAINT "medicos_especialidades_id_especialidad_especialidades_id_especialidad_fk" FOREIGN KEY ("id_especialidad") REFERENCES "public"."especialidades"("id_especialidad") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_id_usuario_usuarios_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_laboratorio_laboratorios_id_laboratorio_fk" FOREIGN KEY ("id_laboratorio") REFERENCES "public"."laboratorios"("id_laboratorio") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_id_paciente_pacientes_id_paciente_fk" FOREIGN KEY ("id_paciente") REFERENCES "public"."pacientes"("id_paciente") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_id_medico_medicos_id_medico_fk" FOREIGN KEY ("id_medico") REFERENCES "public"."medicos"("id_medico") ON DELETE no action ON UPDATE no action;