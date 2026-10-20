// admin/configs/routes.js

import { Router } from 'express';

import * as owners from '../controllers/owner_controllers.js';
import * as enterprises from '../controllers/enterprise_controllers.js';
import * as comensales from '../controllers/comensal_controllers.js';
import { redirectIfAuthenticated, requireAuth, requireRole} from '../../configs/middlewares.js';

const router = Router();

// owner

router.get('/owner', requireRole('owner'), owners.home);
router.get('/owner/ranking', requireRole('owner'), owners.ranking);

// enterprises
router.get('/enterprises', requireRole('enterprises'), enterprises.home);
router.get('/enterprises/bandeja', requireRole('enterprises'), enterprises.bandeja);
router.get('/enterprises/resumenDia', requireRole('enterprises'), enterprises.resumenDia);
router.get('/enterprises/entrega', requireRole('enterprises'), enterprises.entrega);
router.get('/enterprises/opcionesAgregados', requireRole('enterprises'), enterprises.opcionesAgregados);
router.get('/enterprises/Micarta', requireRole('enterprises'), enterprises.Micarta);
router.get('/enterprises/NuevoProducto', requireRole('enterprises'), enterprises.NuevoProducto);
router.get('/enterprises/agotados', requireRole('enterprises'), enterprises.agotados);
router.get('/enterprises/perfil', requireRole('enterprises'), enterprises.perfil);
router.get('/enterprises/PerfilVistaPrevia', requireRole('enterprises'), enterprises.PerfilVistaPrevia);
router.get('/enterprises/horario', requireRole('enterprises'), enterprises.horario);
router.get('/enterprises/resenas', requireRole('enterprises'), enterprises.resenas);

// comensal
router.get('/comensales', requireRole('comensal'), comensales.home);
router.get('/comensales/localescomensal', requireRole('comensal'), comensales.localescomensal);
router.get('/comensales/pedidos', requireRole('comensal'), comensales.pedidos);
router.get('/comensales/calificaciones', requireRole('comensal'), comensales.calificaciones);
router.get('/comensales/micuenta', requireRole('comensal'), comensales.micuenta);
router.get('/comensales/carrito', requireRole('comensal'), comensales.carrito);

router.post('/enterprises/logout', enterprises.salir);
export default router;