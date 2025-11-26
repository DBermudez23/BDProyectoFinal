import express from 'express';

// Controllers (ESM imports)
import * as pacientesCtrl from '../controllers/pacientesController.js';
import * as medicosCtrl from '../controllers/MedicosController.js';
import * as productosCtrl from '../controllers/ProductosController.js';
import * as lotesCtrl from '../controllers/LotesController.js';
import * as recetasCtrl from '../controllers/RecetasController.js';
import * as usuariosCtrl from '../controllers/usuariosController.js';
import * as laboratoriosCtrl from '../controllers/laboratoriosController.js';

const router = express.Router();

// Root
router.get('/', (req, res) => res.json({ ok: true, message: 'API root' }));

// Pacientes
router.get('/pacientes', pacientesCtrl.getAllPacientes);
router.get('/pacientes/:id', pacientesCtrl.getPacienteById);
router.post('/pacientes', pacientesCtrl.createPaciente);
router.put('/pacientes/:id', pacientesCtrl.updatePaciente);
router.delete('/pacientes/:id', pacientesCtrl.deletePaciente);

// Medicos
router.get('/medicos', medicosCtrl.getAllMedicos);
router.get('/medicos/:id', medicosCtrl.getMedicoById);
router.post('/medicos', medicosCtrl.createMedico);
router.put('/medicos/:id', medicosCtrl.updateMedico);
router.delete('/medicos/:id', medicosCtrl.deleteMedico);

// Productos
router.get('/productos', productosCtrl.getAllProductos);
router.get('/productos/:id', productosCtrl.getProductoById);
router.post('/productos', productosCtrl.createProducto);
router.put('/productos/:id', productosCtrl.updateProducto);
router.delete('/productos/:id', productosCtrl.deleteProducto);

// Lotes
router.get('/lotes', lotesCtrl.getAllLotes);
router.get('/lotes/:id', lotesCtrl.getLoteById);
router.post('/lotes', lotesCtrl.createLote);
router.put('/lotes/:id', lotesCtrl.updateLote);
router.delete('/lotes/:id', lotesCtrl.deleteLote);

// Recetas
router.get('/recetas', recetasCtrl.getAllRecetas);
router.get('/recetas/:id', recetasCtrl.getRecetaById);
router.post('/recetas', recetasCtrl.createReceta);
router.put('/recetas/:id', recetasCtrl.updateReceta);
router.delete('/recetas/:id', recetasCtrl.deleteReceta);

// Usuarios
router.get('/usuarios', usuariosCtrl.getAllUsuarios);
router.get('/usuarios/:id', usuariosCtrl.getUsuarioById);
router.post('/usuarios', usuariosCtrl.createUsuario);
router.put('/usuarios/:id', usuariosCtrl.updateUsuario);
router.delete('/usuarios/:id', usuariosCtrl.deleteUsuario);

// Laboratorios
router.get('/laboratorios', laboratoriosCtrl.getAllLaboratorios);
router.get('/laboratorios/:id', laboratoriosCtrl.getLaboratorioById);
router.post('/laboratorios', laboratoriosCtrl.createLaboratorio);
router.put('/laboratorios/:id', laboratoriosCtrl.updateLaboratorio);
router.delete('/laboratorios/:id', laboratoriosCtrl.deleteLaboratorio);

export default router;