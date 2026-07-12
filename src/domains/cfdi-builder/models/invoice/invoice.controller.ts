// ================================
// INVOICE CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildInvoiceServ } from './invoice.service';
import { IInvoiceRequest } from './invoice.model';

// Construye un CFDI de Ingreso
export const buildInvoiceCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IInvoiceRequest;
  const result = await buildInvoiceServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};