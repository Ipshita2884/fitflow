import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw { status: 401, message: 'Unauthorized' };
      const user = await AuthService.getMe(req.user.userId);
      res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      res.status(200).json({ status: 'success', message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  }
}
