import { Router } from 'express';
import AutenticationController from './controllers/AutenticationController';
import UserController from './controllers/UserController';
import autorize from './middlewares/autorize';

const router = new Router();

router.post('/authenticate', AutenticationController.store);

router.post('/users', autorize, UserController.store);

router.put('/users', autorize, UserController.update);

export default router;
