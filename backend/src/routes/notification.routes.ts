import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createNotificationSchema } from '../validators/notification.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'HR'), validate(createNotificationSchema), NotificationController.send);
router.get('/my', NotificationController.myNotifications);
router.put('/:id/read', NotificationController.markRead);
router.put('/mark-all-read', NotificationController.markAllRead);

export default router;