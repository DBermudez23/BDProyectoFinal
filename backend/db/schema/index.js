// Tipo para inferir todas las tablas
import { pacientes, medicos, especialidades, medicosEspecialidades } from './medicalShcema.js';
import { laboratorios, proveedores, productos, lotes } from './productoSchema.js';
import { recetas, detallesReceta, dispensaciones } from './prescripcioneschema.js';
import { usuarios } from './auth.js';

export const schema = {
  // auth
  usuarios,
  // Medical
  pacientes,
  medicos,
  especialidades,
  medicosEspecialidades,
  
  // Products
  laboratorios,
  proveedores,
  productos,
  lotes,
  
  // Prescriptions
  recetas,
  detallesReceta,
  dispensaciones,
};
