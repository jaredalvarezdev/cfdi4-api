// ================================
// PAYMENTS20 XML
// ================================
import { IPayment, IRelatedDocument } from '../../models/payment/payment.model';
import { round2 } from '../../../../shared/utils/round2.util';
import { getSatTaxCode } from '../../../../shared/catalogs/tax-types.catalog';

// Construye los impuestos de UN documento relacionado (ImpuestosDR)
function buildDocumentTaxesXml(doc: IRelatedDocument): string {

    let transfersXml = '';
    let retentionsXml = '';

    for (let taxIndex = 0; taxIndex < doc.taxes.length; taxIndex++) {
        const tax = doc.taxes[taxIndex];
        const base = round2(doc.amountPaid);
        const amount = round2(base * tax.rate);
        const satCode = getSatTaxCode(tax.type);

        if (tax.withholding) {
            retentionsXml += `<pago20:RetencionDR BaseDR="${base}" ImpuestoDR="${satCode}" TipoFactorDR="Tasa" TasaOCuotaDR="${tax.rate.toFixed(6)}" ImporteDR="${amount}"/>`;
        } else {
            transfersXml += `<pago20:TrasladoDR BaseDR="${base}" ImpuestoDR="${satCode}" TipoFactorDR="Tasa" TasaOCuotaDR="${tax.rate.toFixed(6)}" ImporteDR="${amount}"/>`;
        }
    }

    let xml = '';
    if (transfersXml) xml += `<pago20:TrasladosDR>${transfersXml}</pago20:TrasladosDR>`;
    if (retentionsXml) xml += `<pago20:RetencionesDR>${retentionsXml}</pago20:RetencionesDR>`;

    return `<pago20:ImpuestosDR>${xml}</pago20:ImpuestosDR>`;
}

// Construye los impuestos de TODO el pago (ImpuestosP) — junta los de todos los documentos
function buildPaymentTaxesXml(relatedDocuments: IRelatedDocument[]): string {

    let transfersXml = '';
    let retentionsXml = '';

    for (let docIndex = 0; docIndex < relatedDocuments.length; docIndex++) {
        const doc = relatedDocuments[docIndex];
        const base = round2(doc.amountPaid);

        for (let taxIndex = 0; taxIndex < doc.taxes.length; taxIndex++) {
            const tax = doc.taxes[taxIndex];
            const amount = round2(base * tax.rate);
            const satCode = getSatTaxCode(tax.type);

            if (tax.withholding) {
                retentionsXml += `<pago20:RetencionP ImpuestoP="${satCode}" ImporteP="${amount}"/>`;
            } else {
                transfersXml += `<pago20:TrasladoP BaseP="${base}" ImpuestoP="${satCode}" TipoFactorP="Tasa" TasaOCuotaP="${tax.rate.toFixed(6)}" ImporteP="${amount}"/>`;
            }
        }
    }

    let xml = '';
    if (transfersXml) xml += `<pago20:TrasladosP>${transfersXml}</pago20:TrasladosP>`;
    if (retentionsXml) xml += `<pago20:RetencionesP>${retentionsXml}</pago20:RetencionesP>`;

    return `<pago20:ImpuestosP>${xml}</pago20:ImpuestosP>`;
}

// Suma la base y el importe de un traslado de IVA al acumulador correcto según la tasa
// El SAT exige reportar estos totales por separado en pago20:Totales
function addIvaTotal(totals: Record<string, number>, rate: number, base: number, amount: number): void {

    if (rate === 0.16) {
        totals.baseIVA16 = round2(totals.baseIVA16 + base);
        totals.taxIVA16 = round2(totals.taxIVA16 + amount);
    } else if (rate === 0.08) {
        totals.baseIVA8 = round2(totals.baseIVA8 + base);
        totals.taxIVA8 = round2(totals.taxIVA8 + amount);
    } else if (rate === 0) {
        totals.baseIVA0 = round2(totals.baseIVA0 + base);
        totals.taxIVA0 = round2(totals.taxIVA0 + amount);
    }
}

// Convierte los totales de IVA acumulados en los atributos que exige pago20:Totales
// Solo se agrega cada par de atributos si tuvo movimiento (base > 0)
function buildTotalsAttrs(totalPaymentsAmount: number, totals: Record<string, number>): string {

    let attrs = `MontoTotalPagos="${totalPaymentsAmount}"`;

    if (totals.baseIVA16 > 0) {
        attrs += ` TotalTrasladosBaseIVA16="${totals.baseIVA16}" TotalTrasladosImpuestoIVA16="${totals.taxIVA16}"`;
    }
    if (totals.baseIVA8 > 0) {
        attrs += ` TotalTrasladosBaseIVA8="${totals.baseIVA8}" TotalTrasladosImpuestoIVA8="${totals.taxIVA8}"`;
    }
    if (totals.baseIVA0 > 0) {
        attrs += ` TotalTrasladosBaseIVA0="${totals.baseIVA0}" TotalTrasladosImpuestoIVA0="${totals.taxIVA0}"`;
    }

    return attrs;
}

// Genera el complemento de pagos 2.0 — solo aplica para Pago (P)
export function buildPayments20Xml(payments: IPayment[]): string {

    let totalPaymentsAmount = 0;
    let paymentsXml = '';

    // Acumuladores de los totales de IVA por tasa, exigidos en pago20:Totales
    const ivaTotals = {
        baseIVA16: 0, taxIVA16: 0,
        baseIVA8: 0, taxIVA8: 0,
        baseIVA0: 0, taxIVA0: 0,
    };

    for (let paymentIndex = 0; paymentIndex < payments.length; paymentIndex++) {
        const payment = payments[paymentIndex];
        totalPaymentsAmount = round2(totalPaymentsAmount + payment.amount);

        let documentsXml = '';

        for (let docIndex = 0; docIndex < payment.relatedDocuments.length; docIndex++) {
            const doc = payment.relatedDocuments[docIndex];
            const base = round2(doc.amountPaid);

            const objetoImpDR = doc.taxes.length > 0 ? '02' : '01';
            const documentTaxesXml = doc.taxes.length > 0 ? buildDocumentTaxesXml(doc) : '';

            documentsXml += `<pago20:DoctoRelacionado IdDocumento="${doc.uuid}" MonedaDR="MXN" EquivalenciaDR="1" NumParcialidad="${doc.installmentNumber}" ImpSaldoAnt="${doc.previousBalance}" ImpPagado="${doc.amountPaid}" ImpSaldoInsoluto="${doc.remainingBalance}" ObjetoImpDR="${objetoImpDR}">${documentTaxesXml}</pago20:DoctoRelacionado>`;

            // Solo se suman a los totales de IVA los traslados (no las retenciones)
            for (let taxIndex = 0; taxIndex < doc.taxes.length; taxIndex++) {
                const tax = doc.taxes[taxIndex];
                if (tax.withholding) continue;

                const amount = round2(base * tax.rate);

                if (tax.type === 'IVA') {
                    addIvaTotal(ivaTotals, tax.rate, base, amount);
                }
            }
        }

        const paymentTaxesXml = buildPaymentTaxesXml(payment.relatedDocuments);

        paymentsXml += `<pago20:Pago FechaPago="${payment.paymentDate}" FormaDePagoP="${payment.paymentForm}" MonedaP="${payment.currency}" TipoCambioP="1" Monto="${payment.amount}">${documentsXml}${paymentTaxesXml}</pago20:Pago>`;
    }

    const totalsAttrs = buildTotalsAttrs(totalPaymentsAmount, ivaTotals);

    return `<pago20:Pagos Version="2.0"><pago20:Totales ${totalsAttrs}/>${paymentsXml}</pago20:Pagos>`;
}