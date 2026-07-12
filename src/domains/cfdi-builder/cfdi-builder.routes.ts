// ================================
// CFDI BUILDER ROUTES
// ================================
import { Router } from 'express';
import { buildInvoiceCtrl } from './models/invoice/invoice.controller';
import { buildCreditNoteCtrl } from './models/credit-note/credit-note.controller';
import { buildPaymentCtrl } from './models/payment/payment.controller';

const router = Router();

// POST /api/cfdi-builder/invoice
router.post('/invoice', buildInvoiceCtrl);

// POST /api/cfdi-builder/credit-note
router.post('/credit-note', buildCreditNoteCtrl);

// POST /api/cfdi-builder/payment
router.post('/payment', buildPaymentCtrl);

export default router;