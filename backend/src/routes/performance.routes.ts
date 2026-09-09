import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/performance.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'HR', 'MANAGER'), validate(createReviewSchema), PerformanceController.create);
router.get('/my', PerformanceController.myHistory);
router.get('/employee/:employeeId', authorize('ADMIN', 'HR', 'MANAGER'), PerformanceController.employeeHistory);
router.get('/:id', PerformanceController.getOne);
router.put('/:id', authorize('ADMIN', 'HR', 'MANAGER'), validate(updateReviewSchema), PerformanceController.update);

export default router;