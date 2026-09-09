import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { createLeaveTypeSchema, applyLeaveSchema, leaveQuerySchema } from '../validators/leave.validator';

const router = Router();

router.use(authenticate);

router.get('/types', LeaveController.listTypes);
router.post('/types', authorize('ADMIN', 'HR'), validate(createLeaveTypeSchema), LeaveController.createType);

router.post('/apply', validate(applyLeaveSchema), LeaveController.apply);
router.get('/my', LeaveController.myRequests);
router.get('/balance', LeaveController.myBalance);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), validateQuery(leaveQuerySchema), LeaveController.list);
router.put('/:id/approve', authorize('ADMIN', 'HR', 'MANAGER'), LeaveController.approve);
router.put('/:id/reject', authorize('ADMIN', 'HR', 'MANAGER'), LeaveController.reject);

export default router;