// ================================
// RECEIVER XML
// ================================
import { IReceiver } from '../../../../shared/models/shared-cfdi.model';
import { xmlEscape } from '../../../../shared/utils/xml-escape.util';

// Genera el tag del receptor — aplica a Ingreso, Egreso y Pago
export function buildReceiverXml(receiver: IReceiver): string {
    return `<cfdi:Receptor Rfc="${xmlEscape(receiver.rfc)}" Nombre="${xmlEscape(receiver.name)}" DomicilioFiscalReceptor="${receiver.zipCode}" RegimenFiscalReceptor="${receiver.taxRegime}" UsoCFDI="${receiver.cfdiUse}"/>`;
}