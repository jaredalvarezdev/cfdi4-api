// ================================
// ERROR MIDDLEWARE
// ================================
import { Request, Response, NextFunction } from 'express';

// Atrapa cualquier error no controlado y responde con JSON limpio
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.message);

  res.status(500).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  });
};