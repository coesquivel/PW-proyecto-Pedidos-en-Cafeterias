// admin/configs/routes.js

import { Router } from 'express';

import * as owners from '../controllers/owner_controllers.js';
import * as enterprises from '../controllers/enterprise_controllers.js';
import { redirectIfAuthenticated, requireAuth, requireRole} from '../../configs/middlewares.js';

const router = Router();

// owner

router.get('/owner', requireRole('owner'), owners.home);

// enterprises
router.get('/enterprises', requireRole('enterprises'), enterprises.home);
router.get('/enterprises/bandeja', requireRole('enterprises'), enterprises.bandeja);
router.get('/enterprises/resumenDia', requireRole('enterprises'), enterprises.resumenDia);
router.get('/enterprises/entrega', requireRole('enterprises'), enterprises.entrega);
router.get('/enterprises/opcionesAgregados', requireRole('enterprises'), enterprises.opcionesAgregados);
router.get('/enterprises/Micarta', requireRole('enterprises'), enterprises.Micarta);
router.get('/enterprises/agotados', requireRole('enterprises'), enterprises.agotados);
router.get('/enterprises/perfil', requireRole('enterprises'), enterprises.perfil);
router.get('/enterprises/horario', requireRole('enterprises'), enterprises.horario);

export default router;