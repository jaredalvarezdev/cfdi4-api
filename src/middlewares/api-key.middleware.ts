// ================================
// API AUTH MIDDLEWARE
// ================================
import { Request, Response, NextFunction } from 'express';
import { API_USER, API_TOKEN } from '../config/environment';

// Protege las rutas que lo usen, exigiendo los headers x-api-user y x-api-token
export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const providedUser = req.header('x-api-user');
  const providedToken = req.header('x-api-token');

  // Si no configuraste las credenciales en el .env, es un error de configuración del servidor
  if (!API_USER || !API_TOKEN) {
    res.status(500).json({ ok: false, message: 'API_USER o API_TOKEN no configurados en el servidor' });
    return;
  }

  // Ambos headers deben coincidir exactamente con las credenciales configuradas
  if (providedUser !== API_USER || providedToken !== API_TOKEN) {
    res.status(401).json({ ok: false, message: 'Credenciales de API inválidas o faltantes' });
    return;
  }

  next();
};