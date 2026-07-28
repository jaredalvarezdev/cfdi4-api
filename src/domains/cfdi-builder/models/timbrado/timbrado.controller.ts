// ================================
// TIMBRADO CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildTimbradoServ } from './timbrado.service';
import { ITimbradoRequest } from './timbrado.model';

// Construye un CFDI (Ingreso, Egreso o Pago) y lo manda a timbrar al PAC
export const timbrarCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as ITimbradoRequest;
  const result = await buildTimbradoServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.status(200).json(result);
};