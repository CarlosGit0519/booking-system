import express from 'express';

import { errorHandler } from './middlewares/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { serviceRouter } from './modules/services/service.routes.js';

export const app = express();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/services', serviceRouter);

app.use(errorHandler);
