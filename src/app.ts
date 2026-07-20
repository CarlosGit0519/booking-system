import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { openApiSpecification } from './docs/openapi.js';
import { errorHandler } from './middlewares/error-handler.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { bookingRouter } from './modules/bookings/booking.routes.js';
import { serviceRouter } from './modules/services/service.routes.js';
import { staffRouter } from './modules/staff/staff.routes.js';

export const app = express();

const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/staff', staffRouter);

app.use(errorHandler);
