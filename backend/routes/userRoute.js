import { obtenerPacientes, obtenerPacientePorId, crearPaciente, actualizarPaciente, eliminarPaciente, buscarPacientes } from '../controllers/pacientesController.js';
import { obtenerMedicos, obtenerMedicoPorId, crearMedico, actualizarMedico, eliminarMedico, buscarMedico } from '../controllers/medicosController.js';
import { obtenerLaboratorios, obtenerLaboratoriosPorId, crearLaboratorio, eliminarLaboratorio } from '../controllers/laboratoriosController.js';
import express from 'express';
import { crearUsuario, obtenerUsuarios, obtenerUsuarioPorId, actualizarUsuario, eliminarUsuario } from '../controllers/usuariosController.js';


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

userRouter.get('/laboratorios', obtenerLaboratorios);
userRouter.get('/laboratorios/:id', obtenerLaboratoriosPorId);
userRouter.post('/laboratorios/create', crearLaboratorio);
userRouter.delete('laboratorios/delete/:id', eliminarLaboratorio);

userRouter.get('/usuarios/', obtenerUsuarios);
userRouter.get('/usuarios/:id', obtenerUsuarioPorId);
userRouter.post('/usuerios/create', crearUsuario);
userRouter.delete('/usuarios/', eliminarUsuario);

export default userRouter;