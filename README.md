```
# PROYECTO FINAL ACADÉMICO - CURSO BASES DE DATOS UTP

## 📋 Descripción
Proyecto en el cual se realiza un modulo para un sistema para mejorar la gestión de un hospital, el problema a solucionar se basa en la formulación de recetas ya que no se puede llevar un control claro y preciso del inventario. La solución se lleva a cabo a partir de un formulario con capacidad de revisión de stock de lotes en el inventario para llevar un control preciso en la formulación de recetas médicas.

## 🚀 Características Principales
- **Control de Inventario**: Lotes, vencimientos y stock
- **Sistema de Recetas**: Prescripciones médicas digitales
- **Dispensación**: Control preciso de medicamentos entregados
- **Roles y Permisos**: Acceso diferenciado por tipo de usuario

## 🏗️ Modelo Entidad Relación

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : ""
    USUARIOS ||--o| PACIENTES : ""
    USUARIOS ||--o| MEDICOS : ""
    MEDICOS ||--o{ MEDICOS_ESPECIALIDADES : ""
    ESPECIALIDADES ||--o{ MEDICOS_ESPECIALIDADES : ""
    LABORATORIOS ||--o{ PRODUCTOS : ""
    PRODUCTOS ||--o{ LOTES : ""
    PROVEEDORES ||--o{ LOTES : ""
    PACIENTES ||--o{ RECETAS : ""
    MEDICOS ||--o{ RECETAS : ""
    RECETAS ||--o{ DETALLES_RECETA : ""
    PRODUCTOS ||--o{ DETALLES_RECETA : ""
    DETALLES_RECETA ||--o{ DISPENSACIONES : ""
    LOTES ||--o{ DISPENSACIONES : ""
    USUARIOS ||--o{ DISPENSACIONES : ""

    ROLES {
        int idRol PK
        varchar nombre_rol
        varchar descripcion
    }

    USUARIOS {
        int idUsuario PK
        int idRol FK
        varchar tipo_documento
        varchar numero_documento UK
        varchar primer_nombre
        varchar segundo_nombre
        varchar primer_apellido
        varchar segundo_apellido
        varchar email UK
        varchar telefono
        date fecha_nacimiento
        varchar genero
        varchar direccion
        varchar ciudad
        varchar password_hash
        boolean activo
        timestamp created_at
    }

    PACIENTES {
        int idPaciente PK
        int idUsuario FK
        varchar tipo_sangre
        text alergias
        text condiciones_medicas
        varchar contacto_emergencia_nombre
        varchar contacto_emergencia_telefono
        varchar estado_civil
        varchar ocupacion
    }

    MEDICOS {
        int idMedico PK
        int idUsuario FK
        varchar especialidad_principal
        varchar registro_medico UK
        varchar universidad
        int anio_graduacion
        boolean estado_activo
    }

    ESPECIALIDADES {
        int idEspecialidad PK
        varchar nombre_especialidad UK
        text descripcion
    }

    MEDICOS_ESPECIALIDADES {
        int idMedico PK,FK
        int idEspecialidad PK,FK
    }

    LABORATORIOS {
        int idLaboratorio PK
        varchar nombre_laboratorio UK
        text direccion
        varchar telefono
        varchar email
        boolean activo
    }

    PRODUCTOS {
        int idProducto PK
        int idLaboratorio FK
        varchar codigo_producto UK
        varchar nombre_comercial
        varchar nombre_generico
        varchar principio_activo
        varchar concentracion
        varchar forma_farmaceutica
        varchar via_administracion
        varchar presentacion
        text contraindicaciones
        text efectos_secundarios
        boolean requiere_formula
        boolean activo
    }

    PROVEEDORES {
        int idProveedor PK
        varchar nombre_proveedor UK
        varchar contacto_nombre
        varchar telefono
        varchar email
        text direccion
        boolean activo
    }

    LOTES {
        int idLote PK
        int idProducto FK
        int idProveedor FK
        varchar numero_lote UK
        date fecha_fabricacion
        date fecha_vencimiento
        int cantidad_recibida
        int cantidad_disponible
        decimal precio_compra
        decimal precio_venta
        varchar ubicacion
        varchar estado
        timestamp created_at
    }

    RECETAS {
        int idReceta PK
        int idPaciente FK
        int idMedico FK
        varchar codigo_receta UK
        timestamp fecha_prescripcion
        text diagnostico_principal
        text instrucciones_generales
        varchar estado
        boolean validada
        timestamp created_at
    }

    DETALLES_RECETA {
        int idDetalle PK
        int idReceta FK
        int idProducto FK
        varchar dosis
        varchar frecuencia
        varchar via_administracion
        varchar duracion_tratamiento
        int cantidad_prescrita
        text observaciones
        text posologia
    }

    DISPENSACIONES {
        int idDispensacion PK
        int idDetalleReceta FK
        int idLote FK
        int cantidad_dispensada
        timestamp fecha_dispensacion
        int dispensado_por FK
        text observaciones
    }
```

## 🔄 Proceso Optimizado (Normalizado)

```mermaid
graph TD
    A[Médico prescribe] --> B[Sistema valida stock]
    B --> C[Genera receta electrónica]
    C --> D[Paciente lleva código]
    D --> E[Farmacéutico escanea]
    E --> F[Sistema verifica validez]
    F --> G[Consulta lotes disponibles]
    G --> H[Registra dispensación]
    H --> I[Actualiza inventario automáticamente]
```

## 📋 Historias de Usuario - Sistema de Gestión Clínica

### 📋 EPIC: Gestión de Recetas Médicas

| ID | Rol | Función | Criterios de Aceptación | Prioridad | Estimación |
|----|-----|---------|-------------------------|-----------|------------|
| **HU-001** | Médico | Prescribir recetas electrónicas | • Buscar paciente por documento<br>• Ver historial médico<br>• Buscar medicamentos en inventario<br>• Especificar dosis/frecuencia<br>• Generar código único | Alta | 8 puntos |
| **HU-002** | Farmacéutico | Dispensar medicamentos | • Escanear código de receta<br>• Verificar validez<br>• Consultar stock por lote<br>• Registrar dispensación<br>• Actualizar inventario | Alta | 5 puntos |
| **HU-003** | Paciente | Consultar recetas activas | • Acceso con credenciales<br>• Ver recetas "Activa"/"Validada"<br>• Consultar detalles medicamentos<br>• Descargar PDF | Media | 3 puntos |

### 📦 EPIC: Gestión de Inventario

| ID | Rol | Función | Criterios de Aceptación | Prioridad | Estimación |
|----|-----|---------|-------------------------|-----------|------------|
| **HU-004** | Administrador | Gestionar inventario | • Registrar nuevos lotes<br>• Control stock min/max<br>• Alertas vencimientos<br>• Reportes de movimientos | Alta | 8 puntos |
| **HU-005** | Médico | Consultar disponibilidad | • Buscar por nombre/principio activo<br>• Ver stock tiempo real<br>• Consultar alternativas sin stock | Alta | 5 puntos |
| **HU-008** | Farmacéutico | Control de caducidad | • Alertas lotes próximos vencer<br>• Reporte productos caducados<br>• Gestión de devoluciones | Media | 5 puntos |

### 🔐 EPIC: Gestión de Usuarios y Seguridad

| ID | Rol | Función | Criterios de Aceptación | Prioridad | Estimación |
|----|-----|---------|-------------------------|-----------|------------|
| **HU-006** | Administrador | Gestión roles y permisos | • Crear/asignar roles<br>• Configurar permisos por módulo<br>• Activar/desactivar usuarios | Alta | 8 puntos |
| **HU-010** | Todos los usuarios | Autenticación segura | • Login con email/password<br>• Recuperación de contraseña<br>• Tokens JWT<br>• Logout seguro | Alta | 5 puntos |
| **HU-011** | Paciente | Registro y perfil | • Registro autónomo<br>• Actualizar datos personales<br>• Historial médico personal | Media | 5 puntos |

### 📊 EPIC: Reportes y Analíticas

| ID | Rol | Función | Criterios de Aceptación | Prioridad | Estimación |
|----|-----|---------|-------------------------|-----------|------------|
| **HU-013** | Administrador | Dashboard general | • Métricas recetas mensuales<br>• Stock crítico<br>• Médicos más activos<br>• Productos más recetados | Media | 8 puntos |
| **HU-014** | Farmacéutico | Reportes dispensación | • Movimientos diarios<br>• Lotes próximos vencer<br>• Productos más dispensados | Media | 5 puntos |

### 👥 EPIC: Gestión de Pacientes

| ID | Rol | Función | Criterios de Aceptación | Prioridad | Estimación |
|----|-----|---------|-------------------------|-----------|------------|
| **HU-016** | Médico | Historial médico | • Ver historial completo<br>• Alergias y condiciones<br>• Recetas anteriores<br>• Contacto emergencia | Alta | 5 puntos |
| **HU-017** | Paciente | Actualizar información | • Modificar datos contacto<br>• Actualizar alergias<br>• Cambiar contacto emergencia | Media | 3 puntos |

## 🗄️ Arquitectura de Base de Datos

### Tablas Implementadas (13)
| Tabla | Descripción |
|-------|-------------|
| `roles` | Roles del sistema (admin, médico, paciente, farmacéutico) |
| `permisos` | Permisos específicos por rol |
| `roles_permisos` | Relación muchos-a-muchos entre roles y permisos |
| `usuarios` | Usuarios del sistema con información personal |
| `pacientes` | Información médica de pacientes |
| `medicos` | Especialidades y registros médicos |
| `laboratorios` | Laboratorios farmacéuticos |
| `proveedores` | Proveedores de medicamentos |
| `productos` | Catálogo de medicamentos e insumos |
| `lotes` | Control de inventario y vencimientos |
| `recetas` | Prescripciones médicas |
| `detalles_receta` | Medicamentos prescritos en cada receta |
| `dispensaciones` | Registro de medicamentos dispensados |

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Drizzle ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Base de datos principal
- **Supabase** - Plataforma backend como servicio

### Desarrollo
- **JavaScript** - Tipado estático
- **Git** - Control de versiones
- **Drizzle Kit** - Herramientas de migración
- **React.js** - Libreria basada en componentes
- **Tailwind CSS** - Framework CSS

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Cuenta en Supabase
- PostgreSQL 14+

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/DBermudez23/BDProyectoFinal.git
cd BDProyectoFinal/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Configuración de Base de Datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener connection string desde Settings > Database
3. Configurar en `.env`:
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Migraciones
```bash
# Sincronizar esquema con la base de datos
npm run db:push

# Generar migraciones
npm run db:generate

# Abrir interfaz visual
npm run db:studio
```

## 👥 Roles del Sistema

### Médico
- Crear y gestionar recetas médicas
- Consultar historial de pacientes
- Prescribir medicamentos

### Farmacéutico
- Dispensar medicamentos
- Gestionar inventario
- Controlar vencimientos

## 📊 Scripts Disponibles

```bash
npm run db:push      # Sincronizar esquema con BD
npm run db:studio    # Interfaz visual de la BD
npm run db:generate  # Generar migraciones
npm run db:migrate   # Aplicar migraciones
```

## 📝 Ejemplos para Endpoints

### Pacientes
```json
{
  "tipoDocumento": "TI",
  "numeroDocumento": "1000123456",
  "primerNombre": "Valentina",
  "primerApellido": "Castro",
  "segundoApellido": "Martínez",
  "email": "valentina.castro@email.com",
  "telefono": "3207894561",
  "fechaNacimiento": "2009-11-30",
  "genero": "Femenino",
  "direccion": "Conjunto Cerritos Torre 5",
  "ciudad": "Pereira",
  "tipoSangre": "AB+",
  "alergias": "Polen, ácaros",
  "condicionesMedicas": "Rinitis alérgica",
  "contactoEmergenciaNombre": "Laura Martínez",
  "contactoEmergenciaTelefono": "3009876543",
  "estadoCivil": "Soltera",
  "ocupacion": "Estudiante"
}
```

### Médicos
```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "19234343",
  "primerNombre": "Luis Fernando",
  "primerApellido": "Martínez",
  "segundoApellido": "Gómez",
  "email": "dr.martinez@clinicapereira.com",
  "telefono": "3001234567",
  "especialidadPrincipal": "Medicina Interna",
  "registroMedico": "RM-77001",
  "universidad": "Universidad Tecnológica de Pereira",
  "anioGraduacion": 2003
}
```

### Productos
```json
{
  "codigoProducto": "INV-001239",
  "nombreComercial": "Acetaminofén Jarabe 120 mg/5ml",
  "nombreGenerico": "Paracetamol jarabe",
  "principioActivo": "Paracetamol",
  "concentracion": "120 mg/5ml",
  "formaFarmaceutica": "Jarabe",
  "presentacion": "Frasco x 120 ml",
  "requiereFormula": false
}
```

### Lotes
```json
{
  "idProducto": 4,
  "numeroLote": "LOT-OME-2025D",
  "fechaFabricacion": "2025-04-01",
  "fechaVencimiento": "2027-03-31",
  "cantidadRecibida": 400,
  "precioCompra": 1800,
  "precioVenta": 4800
}
```

### Recetas
```json
{
  "idPaciente": 1,
  "idMedico": 1,
  "codigoReceta": "REC-2025-0001",
  "diagnosticoPrincipal": "Hipertensión arterial esencial (I10) con cefalea tensional ocasional",
  "instruccionesGenerales": "Tomar los medicamentos según indicación. Control de presión arterial en 30 días. Evitar sal y realizar actividad física moderada.",
  "estado": "Activa",
  "validada": true,
  "detalles": [
    {
      "idProducto": 3,
      "dosis": "50 mg",
      "frecuencia": "1 tableta cada 24 horas",
      "viaAdministracion": "Oral",
      "duracionTratamiento": "30 días",
      "cantidadPrescrita": 30,
      "posologia": "Tomar por la mañana con el desayuno",
      "observaciones": "Losartán potásico - Control de hipertensión"
    },
    {
      "idProducto": 1,
      "dosis": "500 mg",
      "frecuencia": "1 tableta cada 8 horas",
      "viaAdministracion": "Oral",
      "duracionTratamiento": "5 días",
      "cantidadPrescrita": 15,
      "posologia": "Solo en caso de cefalea intensa",
      "observaciones": "Paracetamol - Dolor de cabeza"
    }
  ]
}
```

## 🤝 Contribuidores

- **Juan Felipe Lelion** - [juanfelipelelion@gmail.com](mailto:juanfelipelelion@gmail.com)
- **Daniel Felipe Bermudez** - [d.bermudez1@utp.edu.co](mailto:d.bermudez1@utp.edu.co)
- **Cristian Castañeda** - [cristian.castaneda1@utp.edu.co](mailto:cristian.castaneda1@utp.edu.co)

## 📄 Licencia
Este proyecto es desarrollado con fines académicos.
```

