import { Router } from 'express';

import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { getDashboard, listBookings, listServices, updateBookingStatus } from './admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/dashboard', getDashboard);
adminRouter.get('/bookings', listBookings);
adminRouter.patch('/bookings/:bookingId/status', updateBookingStatus);
adminRouter.get('/services', listServices);
