// admin/configs/routes.js
import { Router } from 'express';

import * as owners from '../controllers/owner_controllers.js';
import * as enterprises from '../controllers/enterprise_controllers.js';

const router = Router();

// Entrar a administrador para dar mantenimiento a tablas fuertes

router.get('/owner', owners.home);

// rutas panel de control
router.get('/enterprises', enterprises.home);
router.get('/enterprises/bandeja', enterprises.bandeja);
router.get('/enterprises/resumenDia', enterprises.resumenDia);
router.get('/enterprises/entrega', enterprises.entrega);
router.get('/enterprises/opcionesAgregados', enterprises.opcionesAgregados);
router.get('/enterprises/Micarta', enterprises.Micarta);
router.get('/enterprises/agotados', enterprises.agotados);
router.get('/enterprises/perfil', enterprises.perfil);
router.get('/enterprises/horario', enterprises.horario);

export default router;