// routes/userRoute.js
import express from 'express';
import { 
  obtenerPacientes, 
  obtenerPacientePorId, 
  crearPaciente, 
  actualizarPaciente, 
  eliminarPaciente, 
  buscarPacientes 
} from '../controllers/pacientesController.js';

import { 
  obtenerMedicos, 
  obtenerMedicoPorId, 
  crearMedico, 
  actualizarMedico, 
  eliminarMedico, 
  buscarMedico 
} from '../controllers/medicosController.js';

import { 
  obtenerLaboratorios, 
  obtenerLaboratoriosPorId, 
  crearLaboratorio, 
  eliminarLaboratorio 
} from '../controllers/laboratoriosController.js';

import { 
  crearUsuario, 
  obtenerUsuarios, 
  obtenerUsuarioPorId, 
  actualizarUsuario, 
  eliminarUsuario 
} from '../controllers/usuariosController.js';

import { 
  crearLote, 
  obtenerLotes, 
  obtenerLotePorId, 
  eliminarLote 
} from '../controllers/lotesController.js';

import { 
  crearProducto, 
  obtenerProductos, 
  obtenerProductoPorId, 
  eliminarProducto 
} from '../controllers/productosController.js';

const userRouter = express.Router();

userRouter.get('/pacientes', obtenerPacientes);
userRouter.get('/pacientes/:id', obtenerPacientePorId);
userRouter.post('/pacientes', crearPaciente); 
userRouter.put('/pacientes/:id', actualizarPaciente); 
userRouter.delete('/pacientes/:id', eliminarPaciente); 
userRouter.get('/pacientes/buscar/search', buscarPacientes);

userRouter.get('/medicos', obtenerMedicos);
userRouter.get('/medicos/:id', obtenerMedicoPorId);
userRouter.post('/medicos', crearMedico); 
userRouter.put('/medicos/:id', actualizarMedico); 
userRouter.delete('/medicos/:id', eliminarMedico); 
userRouter.get('/medicos/buscar/search', buscarMedico);

userRouter.get('/laboratorios', obtenerLaboratorios);
userRouter.get('/laboratorios/:id', obtenerLaboratoriosPorId);
userRouter.post('/laboratorios', crearLaboratorio); 
userRouter.delete('/laboratorios/:id', eliminarLaboratorio)

userRouter.get('/usuarios', obtenerUsuarios);
userRouter.get('/usuarios/:id', obtenerUsuarioPorId);
userRouter.post('/usuarios', crearUsuario); // Corregido 
userRouter.put('/usuarios/:id', actualizarUsuario); // Agr
userRouter.delete('/usuarios/:id', eliminarUsuario); // Corregid

userRouter.get('/lotes', obtenerLotes);
userRouter.get('/lotes/:id', obtenerLotePorId);
userRouter.post('/lotes', crearLote); 
userRouter.delete('/lotes/:id', eliminarLote); 

userRouter.get('/productos', obtenerProductos);
userRouter.get('/productos/:id', obtenerProductoPorId);
userRouter.post('/productos', crearProducto); 
userRouter.delete('/productos/:id', eliminarProducto); 

export default userRouter;