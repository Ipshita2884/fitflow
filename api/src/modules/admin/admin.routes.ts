import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { AdminController } from './admin.controller';

const router = Router();

// Strict RBAC — only ADMIN users can invoke these routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/users', AdminController.listUsers);
router.get('/verification', AdminController.listVerificationQueue);
router.post('/verification/verify', AdminController.verifyCertification);

export default router;
