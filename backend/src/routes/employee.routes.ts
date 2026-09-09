import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } from '../validators/employee.validator';
import { uploadProfilePhoto } from '../config/upload';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), validateQuery(employeeQuerySchema), EmployeeController.list);
router.get('/:id', EmployeeController.getOne);

router.post('/', authorize('ADMIN', 'HR'), validate(createEmployeeSchema), EmployeeController.create);
router.put('/:id', authorize('ADMIN', 'HR'), validate(updateEmployeeSchema), EmployeeController.update);
router.delete('/:id', authorize('ADMIN'), EmployeeController.remove);

router.post(
  '/:id/photo',
  authorize('ADMIN', 'HR'),
  uploadProfilePhoto.single('photo'),
  EmployeeController.uploadPhoto
);

export default router;