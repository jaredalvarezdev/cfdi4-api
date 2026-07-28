// ================================
// CORS MIDDLEWARE
// ================================
import { Request, Response, NextFunction } from 'express';

// Permite peticiones desde cualquier origen (uso local)
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Responde inmediatamente las peticiones OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};