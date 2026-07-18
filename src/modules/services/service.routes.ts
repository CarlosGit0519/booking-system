import { Router } from 'express';

import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createService, getService, listServices, updateService } from './service.controller.js';

export const serviceRouter = Router();

serviceRouter.get('/', listServices);
serviceRouter.get('/:id', getService);
serviceRouter.post('/', requireAuth, requireRole('ADMIN'), createService);
serviceRouter.patch('/:id', requireAuth, requireRole('ADMIN'), updateService);
