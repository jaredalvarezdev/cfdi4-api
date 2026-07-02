// ================================
// CFDI BUILDER CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildInvoiceServ, buildCreditNoteServ, buildPaymentServ } from './services/build-cfdi.service';
import { IInvoiceRequest } from './requests/invoice.request';
import { ICreditNoteRequest } from './requests/credit-note.request';
import { IPaymentRequest } from './requests/payment.request';

// Construye un CFDI de Ingreso
export const buildInvoiceCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IInvoiceRequest;
  data.type = 'I'; // Asegura que el tipo sea 'I' para Ingreso
  const result = await buildInvoiceServ(data);

  // Si hubo un error de validación, responde con status 400 y el mensaje
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  // Si todo salió bien, responde con el XML
  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};

// Construye un CFDI de Egreso
export const buildCreditNoteCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as ICreditNoteRequest;
  data.type = 'E'; // Asegura que el tipo sea 'E' para Egreso
  const result = await buildCreditNoteServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};

// Construye un CFDI de Pago
export const buildPaymentCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as IPaymentRequest;
  data.type = 'P'; // Asegura que el tipo sea 'P' para Pago
  const result = await buildPaymentServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};