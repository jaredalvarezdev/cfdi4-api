// ================================
// VOUCHER XML
// ================================
import { localDate } from '../../../../shared/utils/date.util';
import { IInvoiceRequest } from '../../models/invoice/invoice.model';
import { ICreditNoteRequest } from '../../models/credit-note/credit-note.model';
import { IPaymentRequest } from '../../models/payment/payment.model';

// Genera el nodo raíz del CFDI 4.0 — aplica a Ingreso, Egreso y Pago
export function buildVoucherXml(
    payload: IInvoiceRequest | ICreditNoteRequest | IPaymentRequest,
    subtotal: number,
    total: number
): string {

    // Pago tiene atributos diferentes a Ingreso y Egreso
    // También necesita el namespace de pago20 declarado aquí
    if (payload.type === 'P') {
        return `<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd" Version="4.0" Fecha="${localDate()}" Sello="" NoCertificado="00000000000000000000" Certificado="" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" Exportacion="01" LugarExpedicion="${payload.expeditionZipCode}">`;
    }

    // TipoCambio solo debe aparecer cuando la moneda es distinta de MXN y XXX
    // (regla SAT CFDI40115). Con MXN/XXX se omite; el validador general ya
    // garantiza que exchangeRate venga bien (>0) cuando aplica.
    const isMxnOrXxx = payload.currency === 'MXN' || payload.currency === 'XXX';
    const exchangeRateAttribute = (!isMxnOrXxx && payload.exchangeRate)
        ? ` TipoCambio="${payload.exchangeRate.toFixed(2)}"`
        : '';

    // Ingreso y Egreso tienen forma de pago, método de pago y exportación
    return `<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Fecha="${localDate()}" Sello="" NoCertificado="00000000000000000000" Certificado="" SubTotal="${subtotal}" FormaPago="${payload.paymentForm}" Moneda="${payload.currency}"${exchangeRateAttribute} Total="${total}" TipoDeComprobante="${payload.type}" MetodoPago="${payload.paymentMethod}" Exportacion="01" LugarExpedicion="${payload.expeditionZipCode}">`;
}