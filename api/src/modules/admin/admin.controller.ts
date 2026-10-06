import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AdminService } from './admin.service';

export class AdminController {
  static async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({ status: 'success', data: { stats } });
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = req.query.search as string;
      const role = req.query.role as string;
      const result = await AdminService.listUsers(page, limit, search, role);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async listVerificationQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queue = await AdminService.listVerificationQueue();
      res.status(200).json({ status: 'success', data: { queue } });
    } catch (err) {
      next(err);
    }
  }

  static async verifyCertification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { certificationId, approve } = req.body;
      const result = await AdminService.verifyCertification(req.user!.userId, certificationId, approve);
      res.status(200).json({ status: 'success', data: { result } });
    } catch (err) {
      next(err);
    }
  }
}
