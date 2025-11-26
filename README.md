# PROYECTO FINAL ACADEMICO  - CURSO BASES DE DATOS UTP

## 📋 Descripción
Proyecto en el cual se realiza un modulo para un sistema para mejorar la gestión de un hospital, el problema a solucionar se basa en la formulación de recetas ya que no se puede llevar un control claro y preciso del inventario. La solución se lleva a cabo a partir de un formulario con capacidad de revisión de stock de lotes en el inventario para llevar un control preciso en la formulación de recetas médicas.

## 🚀 Características Principales
- **Control de Inventario**: Lotes, vencimientos y stock
- **Sistema de Recetas**: Prescripciones médicas digitales
- **Dispensación**: Control preciso de medicamentos entregados
- **Roles y Permisos**: Acceso diferenciado por tipo de usuario

## 🗄️ Arquitectura de Base de Datos

### Esquema Principal
```mermaid
erDiagram
    roles ||--o{ usuarios : ""
    usuarios ||--o| pacientes : ""
    usuarios ||--o| medicos : ""
    roles ||--o{ roles_permisos : ""
    permisos ||--o{ roles_permisos : ""
    laboratorios ||--o{ productos : ""
    productos ||--o{ lotes : ""
    proveedores ||--o{ lotes : ""
    pacientes ||--o{ recetas : ""
    medicos ||--o{ recetas : ""
    recetas ||--o{ detalles_receta : ""
    productos ||--o{ detalles_receta : ""
    detalles_receta ||--o{ dispensaciones : ""
    lotes ||--o{ dispensaciones : ""
    usuarios ||--o{ dispensaciones : ""
```

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

## Ejemplos para endpoints

**Pacientes**
```
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

**Medicos**
```
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

**Productos**
```
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

**Lotes**
```
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
**Recetas**
```
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

---
