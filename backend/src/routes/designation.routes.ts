import { Router } from 'express';
import { DesignationController } from '../controllers/designation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDesignationSchema, updateDesignationSchema } from '../validators/designation.validator';

const router = Router();

router.use(authenticate);

router.get('/', DesignationController.list);
router.get('/:id', DesignationController.getOne);

router.post('/', authorize('ADMIN', 'HR'), validate(createDesignationSchema), DesignationController.create);
router.put('/:id', authorize('ADMIN', 'HR'), validate(updateDesignationSchema), DesignationController.update);
router.delete('/:id', authorize('ADMIN'), DesignationController.remove);

export default router;