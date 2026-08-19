import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import * as bookingController from './booking.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', requireRole('CLIENT'), bookingController.listMyBookings);
router.get('/session/:sessionId', requireRole('TRAINER'), bookingController.listSessionBookings);
router.post('/', requireRole('CLIENT'), bookingController.createBooking);
router.patch('/:id/cancel', bookingController.cancelBooking); // client(owner) or trainer, checked in service

export default router;
