// ================================
// CREDIT NOTE CONTROLLER
// ================================
import { Request, Response } from 'express';
import { buildCreditNoteServ } from './credit-note.service';
import { ICreditNoteRequest } from './credit-note.model';

// Construye un CFDI de Egreso
export const buildCreditNoteCtrl = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as ICreditNoteRequest;
  const result = await buildCreditNoteServ(data);

  if (!result.ok) {
    res.status(400).json(result);
    return;
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(result.data as string);
};