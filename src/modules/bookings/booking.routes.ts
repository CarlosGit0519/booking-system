import { Router } from 'express';

import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { cancelBooking, createBooking, listMyBookings } from './booking.controller.js';

export const bookingRouter = Router();

bookingRouter.use(requireAuth, requireRole('CUSTOMER'));
bookingRouter.post('/', createBooking);
bookingRouter.get('/me', listMyBookings);
bookingRouter.patch('/:bookingId/cancel', cancelBooking);
