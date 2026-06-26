// ================================
// VOUCHER XML
// ================================
import { localDate } from '../../../../shared/utils/date.util';
import { IInvoiceRequest } from '../../requests/invoice.request';
import { ICreditNoteRequest } from '../../requests/credit-note.request';
import { IPaymentRequest } from '../../requests/payment.request';

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

    // Ingreso y Egreso tienen forma de pago, método de pago y exportación
    return `<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Fecha="${localDate()}" Sello="" NoCertificado="00000000000000000000" Certificado="" SubTotal="${subtotal}" FormaPago="${payload.paymentForm}" Moneda="${payload.currency}" Total="${total}" TipoDeComprobante="${payload.type}" MetodoPago="${payload.paymentMethod}" Exportacion="01" LugarExpedicion="${payload.expeditionZipCode}">`;
}