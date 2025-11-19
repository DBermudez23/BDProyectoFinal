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

## 🤝 Contribuidores

- **Juan Felipe Lelion** - [juanfelipelelion@gmail.com](mailto:juanfelipelelion@gmail.com)
- **Daniel Felipe Bermudez** - [d.bermudez1@utp.edu.co](mailto:d.bermudez1@utp.edu.co)
- **Cristian Castañeda** - [cristian.castaneda1@utp.edu.co](mailto:cristian.castaneda1@utp.edu.co)


## 📄 Licencia
Este proyecto es desarrollado con fines académicos.

---
