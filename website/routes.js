// website/routes.js
import { Router } from 'express';

import * as controller from './controllers.js';
import * as api from './apis.js';
import { redirectIfAuthenticated, requireAuth, redirecionarSiLogueado} from '../configs/middlewares.js'; 

const router = Router();

router.get('/', controller.home);
router.get('/login', redirecionarSiLogueado, controller.login);
router.post('/login', controller.ingresar);

router.post('/sign-in', redirectIfAuthenticated, controller.login);
router.get('/sign-out', requireAuth, controller.logout);
router.get('/api/v1/sessions', api.sessionInfo);

export default router;