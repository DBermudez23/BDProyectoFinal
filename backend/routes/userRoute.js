import { obtenerPacientes, obtenerPacientePorId, crearPaciente, actualizarPaciente, eliminarPaciente, buscarPacientes } from '../controllers/pacientesController.js';
import { obtenerMedicos, obtenerMedicoPorId, crearMedico, actualizarMedico, eliminarMedico, buscarMedico } from '../controllers/medicosController.js';
import express from 'express';


const userRouter = express.Router();

userRouter.get('/pacientes', obtenerPacientes);
userRouter.get('/pacientes/:id', obtenerPacientePorId);
userRouter.post('/pacientes/create', crearPaciente);
userRouter.put('/pacientes/update/:id', actualizarPaciente);
userRouter.delete('/pacientes/delete/:id', eliminarPaciente);
userRouter.get('/pacientes/search', buscarPacientes);

userRouter.get('/medicos', obtenerMedicos);
userRouter.get('/medicos/:id', obtenerMedicoPorId);
userRouter.post('/medicos/create', crearMedico);
userRouter.put('/medicos/update/:id', actualizarMedico);
userRouter.delete('/medicos/delete/:id', eliminarMedico);
userRouter.get('/medicos/search', buscarMedico);

export default userRouter;