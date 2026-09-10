import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/overview', authorize('ADMIN', 'HR', 'MANAGER'), DashboardController.overview);
router.get('/team-summary', authorize('MANAGER'), DashboardController.teamSummary);

export default router;