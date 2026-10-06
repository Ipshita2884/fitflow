import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ClientsService } from './clients.service';

export class ClientsController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ClientsService.listClients(req.user!.userId, req.query);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.createClient(req.user!.userId, req.body);
      res.status(201).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async associate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.associateExistingClient(req.user!.userId, req.body);
      res.status(200).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async find(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ClientsService.findExistingClient(req.user!.userId, req.query.identifier as string);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.getClient(req.user!.userId, req.params.id);
      res.status(200).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.updateClient(req.user!.userId, req.params.id, req.body);
      res.status(200).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.archiveClient(req.user!.userId, req.params.id);
      res.status(200).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await ClientsService.restoreClient(req.user!.userId, req.params.id);
      res.status(200).json({ status: 'success', data: { client } });
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await ClientsService.getClientSummary(req.user!.userId, req.params.id);
      res.status(200).json({ status: 'success', data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async getActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activity = await ClientsService.getClientActivity(req.user!.userId, req.params.id, req.query);
      res.status(200).json({ status: 'success', data: activity });
    } catch (err) {
      next(err);
    }
  }

  static async getProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await ClientsService.getClientProgress(req.user!.userId, req.params.id, req.query);
      res.status(200).json({ status: 'success', data: progress });
    } catch (err) {
      next(err);
    }
  }

  static async getProgressAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await ClientsService.getClientProgressAnalytics(req.user!.userId, req.params.id, req.query);
      res.status(200).json({ status: 'success', data: analytics });
    } catch (err) {
      next(err);
    }
  }

  static async addAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const assessment = await ClientsService.addAssessment(req.user!.userId, req.params.id, req.body);
      res.status(201).json({ status: 'success', data: { assessment } });
    } catch (err) {
      next(err);
    }
  }

  static async addMeasurement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const measurement = await ClientsService.addMeasurement(req.user!.userId, req.params.id, req.body);
      res.status(201).json({ status: 'success', data: { measurement } });
    } catch (err) {
      next(err);
    }
  }
}

