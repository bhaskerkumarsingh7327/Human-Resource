import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';

const router = Router();

router.use(authenticate);

router.get('/', DepartmentController.list);
router.get('/:id', DepartmentController.getOne);

router.post('/', authorize('ADMIN', 'HR'), validate(createDepartmentSchema), DepartmentController.create);
router.put('/:id', authorize('ADMIN', 'HR'), validate(updateDepartmentSchema), DepartmentController.update);
router.delete('/:id', authorize('ADMIN'), DepartmentController.remove);
router.post('/:id/assign-employee', authorize('ADMIN', 'HR'), DepartmentController.assignEmployee);

export default router;