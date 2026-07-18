import swaggerJsdoc from 'swagger-jsdoc';

export const openApiSpecification = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Booking System API',
      version: '1.0.0',
      description:
        'A REST API for service businesses. It manages users, staff schedules, services and bookings without schedule conflicts.',
    },
    servers: [{ url: 'http://localhost:3002', description: 'Local development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Carlos' },
            email: { type: 'string', format: 'email', example: 'carlos@example.com' },
            password: { type: 'string', format: 'password', example: 'SecurePassword123!' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        ServiceInput: {
          type: 'object',
          required: ['name', 'durationMinutes', 'price'],
          properties: {
            name: { type: 'string', example: 'Haircut' },
            description: { type: 'string', example: 'Classic haircut and wash' },
            durationMinutes: { type: 'integer', example: 45 },
            price: { type: 'number', example: 18.5 },
          },
        },
        StaffInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@example.com' },
            password: { type: 'string', format: 'password' },
          },
        },
        ScheduleInput: {
          type: 'object',
          required: ['dayOfWeek', 'startTime', 'endTime'],
          properties: {
            dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '18:00' },
          },
        },
        BookingInput: {
          type: 'object',
          required: ['serviceId', 'staffProfileId', 'startAt'],
          properties: {
            serviceId: { type: 'string', example: 'cmrservice0000000000000000' },
            staffProfileId: { type: 'string', example: 'cmrstaff00000000000000000' },
            startAt: { type: 'string', format: 'date-time', example: '2026-07-20T10:00:00.000Z' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: { summary: 'Check API health', responses: { '200': { description: 'API is running' } } },
      },
      '/api/v1/auth/register': {
        post: {
          summary: 'Register an account',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
          responses: { '201': { description: 'Account created' }, '409': { description: 'Email already exists' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          summary: 'Log in and receive a JWT',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
          responses: { '200': { description: 'Authenticated' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/api/v1/services': {
        get: { summary: 'List active services', responses: { '200': { description: 'Services list' } } },
        post: {
          summary: 'Create a service (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceInput' } } } },
          responses: { '201': { description: 'Service created' }, '403': { description: 'Forbidden' } },
        },
      },
      '/api/v1/staff': {
        get: { summary: 'List active staff and schedules', responses: { '200': { description: 'Staff list' } } },
        post: {
          summary: 'Create a staff account (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StaffInput' } } } },
          responses: { '201': { description: 'Staff member created' } },
        },
      },
      '/api/v1/staff/{staffProfileId}/schedule': {
        put: {
          summary: 'Set a staff member weekly schedule (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'staffProfileId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ScheduleInput' } } } },
          responses: { '200': { description: 'Schedule saved' } },
        },
      },
      '/api/v1/bookings': {
        post: {
          summary: 'Create a booking (customer only)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingInput' } } } },
          responses: { '201': { description: 'Booking created' }, '409': { description: 'Schedule conflict' } },
        },
      },
      '/api/v1/bookings/me': {
        get: {
          summary: 'List the authenticated customer bookings',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Bookings list' } },
        },
      },
      '/api/v1/bookings/{bookingId}/cancel': {
        patch: {
          summary: 'Cancel one of the authenticated customer bookings',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Booking cancelled' } },
        },
      },
    },
  },
  apis: [],
});
