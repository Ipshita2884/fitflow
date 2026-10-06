import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { MessageService } from './message.service';

export class MessageController {
  static async listConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await MessageService.listConversations(req.user!.userId);
      res.status(200).json({ status: 'success', data: { conversations } });
    } catch (err) {
      next(err);
    }
  }

  static async getOrCreateConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetUserId } = req.body;
      const conversation = await MessageService.getOrCreateConversation(req.user!.userId, targetUserId);
      res.status(200).json({ status: 'success', data: { conversation } });
    } catch (err) {
      next(err);
    }
  }

  static async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const result = await MessageService.getMessages(req.user!.userId, req.params.conversationId, page, limit);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      const message = await MessageService.sendMessage(req.user!.userId, req.params.conversationId, text);
      res.status(201).json({ status: 'success', data: { message } });
    } catch (err) {
      next(err);
    }
  }
}
