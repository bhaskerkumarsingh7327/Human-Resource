import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { setSalarySchema, generatePayrollSchema, payrollQuerySchema } from '../validators/payroll.validator';

const router = Router();

router.use(authenticate);

// Salary structure — Admin/HR only
router.post('/salary/:employeeId', authorize('ADMIN', 'HR'), validate(setSalarySchema), PayrollController.setSalary);
router.get('/salary/:employeeId', authorize('ADMIN', 'HR'), PayrollController.getSalary);

// Payroll generation & listing — Admin/HR only
router.post('/generate', authorize('ADMIN', 'HR'), validate(generatePayrollSchema), PayrollController.generate);
router.get('/', authorize('ADMIN', 'HR'), validateQuery(payrollQuerySchema), PayrollController.list);
router.put('/:id/mark-paid', authorize('ADMIN', 'HR'), PayrollController.markPaid);

// Employee self-service
router.get('/my', PayrollController.myPayslips);
router.get('/:id', PayrollController.getOne);

export default router;