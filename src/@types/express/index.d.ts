declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
      };
    }
  }
}

export {};
