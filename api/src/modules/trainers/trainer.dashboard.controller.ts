import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { TrainerDashboardService } from './trainer.dashboard.service';

export class TrainerDashboardController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TrainerDashboardService.getDashboardData(req.user!.userId);
      res.status(200).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  }
}
