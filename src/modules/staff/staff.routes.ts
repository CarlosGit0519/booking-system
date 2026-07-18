import { Router } from 'express';

import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { createStaff, listStaff, setSchedule } from './staff.controller.js';

export const staffRouter = Router();

staffRouter.get('/', listStaff);
staffRouter.post('/', requireAuth, requireRole('ADMIN'), createStaff);
staffRouter.put('/:staffProfileId/schedule', requireAuth, requireRole('ADMIN'), setSchedule);
