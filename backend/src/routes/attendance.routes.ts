import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validateQuery } from '../middleware/validate.middleware';
import { attendanceHistoryQuerySchema, attendanceReportQuerySchema } from '../validators/attendance.validator';

const router = Router();

router.use(authenticate);

router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/my-history', validateQuery(attendanceHistoryQuerySchema), AttendanceController.myHistory);
router.get(
  '/employee/:employeeId',
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(attendanceHistoryQuerySchema),
  AttendanceController.employeeHistory
);
router.get(
  '/report',
  authorize('ADMIN', 'HR', 'MANAGER'),
  validateQuery(attendanceReportQuerySchema),
  AttendanceController.monthlyReport
);

export default router;