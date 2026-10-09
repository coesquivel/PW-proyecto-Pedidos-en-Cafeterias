// website/routes.js
import { Router } from 'express';
import * as api from './apis.js';
import * as controller from './controllers.js';
//import { redirectIfAuthenticated, requireAuth } from '../configs/middlewares.js'; 

const router = Router();

router.get('/', controller.home);
router.get('/login', controller.login);
//router.post('/sign-in', redirectIfAuthenticated, controller.login);
//router.get('/sign-out', requireAuth, controller.logout);
//router.get('/api/v1/sessions', api.sessionInfo);

export default router;