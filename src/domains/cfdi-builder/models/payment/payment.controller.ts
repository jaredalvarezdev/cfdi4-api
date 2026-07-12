// ================================
// PAYMENT CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildPaymentServ } from './payment.service';
import { IPaymentRequest } from './payment.model';

// Construye un CFDI de Pago
export const buildPaymentCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IPaymentRequest;
  const result = await buildPaymentServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};