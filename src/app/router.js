import { Router } from 'express';
import AutenticationController from './controllers/AutenticationController';
import UserController from './controllers/UserController';
import autorize from './middlewares/autorize';
import multer from 'multer';
import multerConfig from './../config/multer';
import UploadController from './controllers/UploadController';
import MeetupController from './controllers/MeetupController';
import SubscribeController from './controllers/SubscribeController';

const upload = multer(multerConfig);
const router = new Router();

router.post('/authenticate', AutenticationController.store);

router.post('/users', autorize, UserController.store);

router.put('/users', autorize, UserController.update);

router.post('/upload', upload.single('file'), UploadController.store);

router.get('/meetups', autorize, MeetupController.index);

router.post('/meetups', autorize, MeetupController.store);

router.put('/meetups/:id', autorize, MeetupController.update);

router.delete('/meetups/:id', autorize, MeetupController.delete);

router.post('/meetups/:id/subscribes', autorize, SubscribeController.store);

router.get('/meetups/subscribes', autorize, SubscribeController.index);

export default router;
