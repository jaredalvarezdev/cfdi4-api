// ================================
// NORMALIZE RECEIVER
// ================================
import { IReceiver } from '../models/shared-cfdi.model';

// Limpia y estandariza los datos del receptor antes de construir el XML
export function normalizeReceiver(receiver: IReceiver, type: 'I' | 'E' | 'P' = 'I'): IReceiver {

    const rfc = receiver.rfc.trim().toUpperCase();
    const name = receiver.name.trim().toUpperCase();
    const zipCode = receiver.zipCode.trim();

    let taxRegime = receiver.taxRegime.trim();
    let cfdiUse = receiver.cfdiUse.trim().toUpperCase();

    // RFC genérico de público en general
    const isGeneric = rfc === 'XAXX010101000';

    // RFC genérico de extranjero
    const isForeign = rfc === 'XEXX010101000';

    // Para RFC genéricos el SAT obliga régimen fiscal fijo
    if (isGeneric || isForeign) {
        taxRegime = '616';
    }

    // Pago (P) siempre usa CP01 como UsoCFDI, sin importar el receptor.
    // Ingreso y Egreso solo lo fuerzan cuando el receptor es genérico.
    if (type === 'P') {
        cfdiUse = 'CP01';
    } else if (isGeneric || isForeign) {
        cfdiUse = 'S01';
    }

    return {
        rfc,
        name,
        zipCode,
        taxRegime,
        cfdiUse,
    };
}