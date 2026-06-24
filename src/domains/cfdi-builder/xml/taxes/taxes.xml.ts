// ================================
// TAXES XML
// ================================
import { IConcept } from '../../requests/invoice.request';
import { round2 } from '../../utils/round2.util';

// Genera el bloque de impuestos globales del CFDI
// Se calcula sumando los impuestos de todos los conceptos
export function buildTaxesXml(concepts: IConcept[]): string {

    let totalTransfers = 0;   // Total de impuestos trasladados
    let totalRetentions = 0;  // Total de retenciones
    let transfersXml = '';    // XML de traslados
    let retentionsXml = '';   // XML de retenciones

    // Recorre cada concepto y acumula sus impuestos
    for (let i = 0; i < concepts.length; i++) {

        const concept = concepts[i];
        const base = round2(concept.unitPrice * concept.quantity);

        for (let j = 0; j < concept.taxes.length; j++) {

            const tax = concept.taxes[j];
            const amount = round2(base * tax.rate);

            if (tax.withholding) {
                totalRetentions = round2(totalRetentions + amount);
                retentionsXml += `<cfdi:Retencion Impuesto="${tax.type}" Importe="${amount}"/>`;
            } else {
                totalTransfers = round2(totalTransfers + amount);
                transfersXml += `<cfdi:Traslado Base="${base}" Impuesto="${tax.type}" TipoFactor="Tasa" TasaOCuota="${tax.rate.toFixed(6)}" Importe="${amount}"/>`;
            }
        }
    }

    let xml = '';
    if (transfersXml) xml += `<cfdi:Traslados>${transfersXml}</cfdi:Traslados>`;
    if (retentionsXml) xml += `<cfdi:Retenciones>${retentionsXml}</cfdi:Retenciones>`;

    return `<cfdi:Impuestos TotalImpuestosTrasladados="${totalTransfers}" TotalImpuestosRetenidos="${totalRetentions}">${xml}</cfdi:Impuestos>`;
}