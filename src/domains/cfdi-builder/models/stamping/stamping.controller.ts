// ================================
// STAMPING CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildStampingServ } from './stamping.service';
import { IStampingRequest } from './stamping.model';

// Construye un CFDI (Ingreso, Egreso o Pago) y lo manda a timbrar al PAC
export const stampCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IStampingRequest;
  const result = await buildStampingServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.status(200).json(result);
};