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

    // El XSD de Pagos 2.0 exige RetencionesDR antes que TrasladosDR dentro de ImpuestosDR
    let xml = '';
    if (retentionsXml) xml += `<pago20:RetencionesDR>${retentionsXml}</pago20:RetencionesDR>`;
    if (transfersXml) xml += `<pago20:TrasladosDR>${transfersXml}</pago20:TrasladosDR>`;

    return `<pago20:ImpuestosDR>${xml}</pago20:ImpuestosDR>`;
}

// Construye los impuestos de todos los documentos relacionados de un pago (ImpuestosP)
function buildPaymentTaxesXml(relatedDocuments: IRelatedDocument[]): string {

    // Traslados se consolidan por tipo+tasa (llevan TasaOCuotaP)
    const transferMap = new Map<string, { type: string; rate: number; base: number; amount: number }>();

    // Retenciones se consolidan solo por tipo (RetencionP no lleva TasaOCuotaP)
    const retentionMap = new Map<string, { type: string; amount: number }>();

    for (let docIndex = 0; docIndex < relatedDocuments.length; docIndex++) {
        const doc = relatedDocuments[docIndex];
        const base = round2(doc.amountPaid);

        for (let taxIndex = 0; taxIndex < doc.taxes.length; taxIndex++) {
            const tax = doc.taxes[taxIndex];
            const amount = round2(base * tax.rate);

            if (tax.withholding) {
                const key = tax.type;
                if (retentionMap.has(key)) {
                    const existing = retentionMap.get(key)!;
                    existing.amount = round2(existing.amount + amount);
                } else {
                    retentionMap.set(key, { type: tax.type, amount });
                }
            } else {
                const key = `${tax.type}-${tax.rate.toFixed(6)}`;
                if (transferMap.has(key)) {
                    const existing = transferMap.get(key)!;
                    existing.base = round2(existing.base + base);
                    existing.amount = round2(existing.amount + amount);
                } else {
                    transferMap.set(key, { type: tax.type, rate: tax.rate, base, amount });
                }
            }
        }
    }

    let transfersXml = '';
    transferMap.forEach((entry) => {
        transfersXml += `<pago20:TrasladoP BaseP="${entry.base}" ImpuestoP="${getSatTaxCode(entry.type)}" TipoFactorP="Tasa" TasaOCuotaP="${entry.rate.toFixed(6)}" ImporteP="${entry.amount}"/>`;
    });

    let retentionsXml = '';
    retentionMap.forEach((entry) => {
        retentionsXml += `<pago20:RetencionP ImpuestoP="${getSatTaxCode(entry.type)}" ImporteP="${entry.amount}"/>`;
    });

    // El XSD de Pagos 2.0 exige RetencionesP antes que TrasladosP dentro de ImpuestosP
    let xml = '';
    if (retentionsXml) xml += `<pago20:RetencionesP>${retentionsXml}</pago20:RetencionesP>`;
    if (transfersXml) xml += `<pago20:TrasladosP>${transfersXml}</pago20:TrasladosP>`;

    return `<pago20:ImpuestosP>${xml}</pago20:ImpuestosP>`;
}

// Suma la base y el importe de un traslado de IVA al acumulador correcto según la tasa
// El SAT exige reportar estos totales por separado en pago20:Totales, siempre en MXN
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

// Suma el importe de una retención al acumulador correcto según el tipo de impuesto
// El SAT exige reportar estos totales por separado en pago20:Totales, siempre en MXN
function addRetentionTotal(totals: Record<string, number>, type: string, amount: number): void {

    if (type === 'IVA') {
        totals.retencionesIVA = round2(totals.retencionesIVA + amount);
    } else if (type === 'ISR') {
        totals.retencionesISR = round2(totals.retencionesISR + amount);
    } else if (type === 'IEPS') {
        totals.retencionesIEPS = round2(totals.retencionesIEPS + amount);
    }
}

// Convierte los totales de IVA y retenciones acumulados en los atributos que exige pago20:Totales
// Solo se agrega cada atributo si tuvo movimiento (> 0)
function buildTotalsAttrs(totalPaymentsAmount: number, transferTotals: Record<string, number>, retentionTotals: Record<string, number>): string {

    let attrs = `MontoTotalPagos="${totalPaymentsAmount}"`;

    if (retentionTotals.retencionesIVA > 0) {
        attrs += ` TotalRetencionesIVA="${retentionTotals.retencionesIVA}"`;
    }
    if (retentionTotals.retencionesISR > 0) {
        attrs += ` TotalRetencionesISR="${retentionTotals.retencionesISR}"`;
    }
    if (retentionTotals.retencionesIEPS > 0) {
        attrs += ` TotalRetencionesIEPS="${retentionTotals.retencionesIEPS}"`;
    }

    if (transferTotals.baseIVA16 > 0) {
        attrs += ` TotalTrasladosBaseIVA16="${transferTotals.baseIVA16}" TotalTrasladosImpuestoIVA16="${transferTotals.taxIVA16}"`;
    }
    if (transferTotals.baseIVA8 > 0) {
        attrs += ` TotalTrasladosBaseIVA8="${transferTotals.baseIVA8}" TotalTrasladosImpuestoIVA8="${transferTotals.taxIVA8}"`;
    }
    if (transferTotals.baseIVA0 > 0) {
        attrs += ` TotalTrasladosBaseIVA0="${transferTotals.baseIVA0}" TotalTrasladosImpuestoIVA0="${transferTotals.taxIVA0}"`;
    }

    return attrs;
}

// Genera el complemento de pagos 2.0 — solo aplica para Pago (P)
export function buildPayments20Xml(payments: IPayment[]): string {

    let totalPaymentsAmount = 0;
    let paymentsXml = '';

    // Acumuladores de los totales de IVA por tasa, exigidos en pago20:Totales (siempre en MXN)
    const ivaTotals = {
        baseIVA16: 0, taxIVA16: 0,
        baseIVA8: 0, taxIVA8: 0,
        baseIVA0: 0, taxIVA0: 0,
    };

    // Acumuladores de los totales de retenciones por tipo de impuesto, exigidos en pago20:Totales (siempre en MXN)
    const retentionTotals = {
        retencionesIVA: 0,
        retencionesISR: 0,
        retencionesIEPS: 0,
    };

    for (let paymentIndex = 0; paymentIndex < payments.length; paymentIndex++) {
        const payment = payments[paymentIndex];

        // TipoCambioP solo se reporta si la moneda del pago NO es MXN ni XXX (moneda de prueba)
        const isMxnOrXxx = payment.currency === 'MXN' || payment.currency === 'XXX';
        const paymentExchangeRate = (!isMxnOrXxx && payment.exchangeRate) ? payment.exchangeRate : 1;

        // MontoTotalPagos siempre debe estar en MXN: cada Monto se convierte por su
        // propio TipoCambioP antes de sumarse al acumulado global.
        totalPaymentsAmount = round2(totalPaymentsAmount + round2(payment.amount * paymentExchangeRate));

        let documentsXml = '';

        for (let docIndex = 0; docIndex < payment.relatedDocuments.length; docIndex++) {
            const doc = payment.relatedDocuments[docIndex];
            const base = round2(doc.amountPaid);

            const objetoImpDR = doc.taxes.length > 0 ? '02' : '01';
            const documentTaxesXml = doc.taxes.length > 0 ? buildDocumentTaxesXml(doc) : '';

            documentsXml += `<pago20:DoctoRelacionado IdDocumento="${doc.uuid}" MonedaDR="MXN" EquivalenciaDR="1" NumParcialidad="${doc.installmentNumber}" ImpSaldoAnt="${doc.previousBalance}" ImpPagado="${doc.amountPaid}" ImpSaldoInsoluto="${doc.remainingBalance}" ObjetoImpDR="${objetoImpDR}">${documentTaxesXml}</pago20:DoctoRelacionado>`;

            // base y amount se convierten a MXN antes de acumularse, porque pago20:Totales
            // siempre debe expresarse en moneda nacional, sin importar la moneda del pago.
            for (let taxIndex = 0; taxIndex < doc.taxes.length; taxIndex++) {
                const tax = doc.taxes[taxIndex];
                const amount = round2(base * tax.rate);
                const amountMxn = round2(amount * paymentExchangeRate);

                if (tax.withholding) {
                    addRetentionTotal(retentionTotals, tax.type, amountMxn);
                } else if (tax.type === 'IVA') {
                    const baseMxn = round2(base * paymentExchangeRate);
                    addIvaTotal(ivaTotals, tax.rate, baseMxn, amountMxn);
                }
            }
        }

        const paymentTaxesXml = buildPaymentTaxesXml(payment.relatedDocuments);

        paymentsXml += `<pago20:Pago FechaPago="${payment.paymentDate}" FormaDePagoP="${payment.paymentForm}" MonedaP="${payment.currency}" TipoCambioP="${paymentExchangeRate}" Monto="${payment.amount}">${documentsXml}${paymentTaxesXml}</pago20:Pago>`;
    }

    const totalsAttrs = buildTotalsAttrs(totalPaymentsAmount, ivaTotals, retentionTotals);

    return `<pago20:Pagos Version="2.0"><pago20:Totales ${totalsAttrs}/>${paymentsXml}</pago20:Pagos>`;
}