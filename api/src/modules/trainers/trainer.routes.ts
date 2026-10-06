import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { TrainerDashboardController } from './trainer.dashboard.controller';

const router = Router();

// Require authenticated TRAINER role
router.use(authenticate, requireRole('TRAINER'));

router.get('/dashboard', TrainerDashboardController.getDashboard);

export default router;
