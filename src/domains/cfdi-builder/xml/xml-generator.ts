// ================================
// XML GENERATOR
// ================================
import { IInvoiceRequest } from '../models/invoice/invoice.model';
import { ICreditNoteRequest } from '../models/credit-note/credit-note.model';
import { IPaymentRequest } from '../models/payment/payment.model';
import { buildVoucherXml } from './voucher/voucher.xml';
import { buildIssuerXml } from './issuer/issuer.xml';
import { buildReceiverXml } from './receiver/receiver.xml';
import { buildConceptsXml } from './concepts/concepts.xml';
import { buildTaxesXml } from './taxes/taxes.xml';
import { buildRelatedCfdiXml } from './related-cfdi/related-cfdi.xml';
import { buildPayments20Xml } from './payments20/payments20.xml';

// Genera el XML completo de un CFDI de Ingreso
export function generateInvoiceXml(payload: IInvoiceRequest, subtotal: number, total: number): string {
    const xml =
        buildVoucherXml(payload, subtotal, total) +
        buildIssuerXml(payload.issuer) +
        buildReceiverXml(payload.receiver) +
        buildConceptsXml(payload.concepts) +
        buildTaxesXml(payload.concepts) +
        '</cfdi:Comprobante>';

    return `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
}

// Genera el XML completo de un CFDI de Egreso
export function generateCreditNoteXml(payload: ICreditNoteRequest, subtotal: number, total: number): string {
    const xml =
        buildVoucherXml(payload, subtotal, total) +
        buildRelatedCfdiXml(payload.relatedCfdi) +
        buildIssuerXml(payload.issuer) +
        buildReceiverXml(payload.receiver) +
        buildConceptsXml(payload.concepts) +
        buildTaxesXml(payload.concepts) +
        '</cfdi:Comprobante>';

    return `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
}

// Genera el XML completo de un CFDI de Pago
export function generatePaymentXml(payload: IPaymentRequest): string {
    const xml =
        buildVoucherXml(payload, 0, 0) +
        buildIssuerXml(payload.issuer) +
        buildReceiverXml(payload.receiver) +
        `<cfdi:Conceptos><cfdi:Concepto ClaveProdServ="84111506" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Cantidad="1" Importe="0"><cfdi:Impuestos/></cfdi:Concepto></cfdi:Conceptos>` +
        `<cfdi:Impuestos/>` +
        `<cfdi:Complemento>${buildPayments20Xml(payload.payments)}</cfdi:Complemento>` +
        '</cfdi:Comprobante>';

    return `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
}