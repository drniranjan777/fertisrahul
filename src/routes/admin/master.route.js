import { Router } from 'express';
import { createMasterController } from '../../controllers/admin/master.controller.js';
import { adminAuth, validate } from '../../middlewares/index.js';
import { createMasterRepository } from '../../repositories/admin/master.repository.js';
import {
  createMasterSchema,
  listMastersSchema,
  masterIdParamSchema,
  updateMasterSchema,
} from '../../validations/admin/master.validator.js';

const validId = validate(masterIdParamSchema, 'params');

export const createMasterRouter = (master) => {
  const controller = createMasterController(createMasterRepository(master), master);
  const router = Router();

  router.use(adminAuth);

  router.get('/', validate(listMastersSchema, 'query'), controller.list);
  router.get('/:id', validId, controller.getById);
  router.post('/', validate(createMasterSchema), controller.create);
  router.put('/:id', validId, validate(updateMasterSchema), controller.update);
  router.delete('/:id', validId, controller.remove);

  return router;
};
