import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { MessageController } from './message.controller';

const router = Router();

router.use(authenticate);

router.get('/conversations', MessageController.listConversations);
router.post('/conversations', MessageController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/conversations/:conversationId/messages', MessageController.sendMessage);

export default router;
