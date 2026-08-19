import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as attendanceController from './attendance.controller';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('TRAINER'), attendanceController.markAttendance);
router.get('/summary', attendanceController.getSummary); // scoped per-role in controller

export default router;
