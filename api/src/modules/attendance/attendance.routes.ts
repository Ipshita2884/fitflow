import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as attendanceController from './attendance.controller';

const router = Router();

router.use(authenticate);


router.post('/', requireRole('TRAINER'), attendanceController.markAttendance);
router.get('/summary', attendanceController.getSummary); // scoped per-role in controller

export default router;
