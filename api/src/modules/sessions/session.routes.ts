import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as sessionController from './session.controller';

const router = Router();

router.use(authenticate);


router.get('/', sessionController.listSessions); // trainer or client, scoped in controller
router.get('/:id', sessionController.getSession);
router.post('/', requireRole('TRAINER'), sessionController.createSession);
router.patch('/:id', requireRole('TRAINER'), sessionController.updateSession);
router.delete('/:id', requireRole('TRAINER'), sessionController.cancelSession);

export default router;
