import { Request, Response, NextFunction } from 'express';
import { API_KEY } from '../config/environment';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.header('x-api-key');

  if (!API_KEY) {
    res.status(500).json({ ok: false, message: 'API_KEY no configurada en el servidor' });
    return;
  }

  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({ ok: false, message: 'API key inválida o faltante' });
    return;
  }

  next();
};