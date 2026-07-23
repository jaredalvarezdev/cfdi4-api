// ================================
// TAXES XML
// ================================
import { IConcept } from '../../../../shared/models/shared-cfdi.model';
import { round2 } from '../../../../shared/utils/round2.util';
import { getSatTaxCode } from '../../../../shared/catalogs/tax-types.catalog';

// Genera el bloque de impuestos globales del CFDI
// Los traslados se consolidan por tipo+tasa como requiere el SAT
export function buildTaxesXml(concepts: IConcept[]): string {

    let totalTransfers = 0;  // Total de impuestos trasladados
    let totalRetentions = 0; // Total de retenciones
    let retentionsXml = '';  // XML de retenciones

    // Mapa para consolidar traslados por tipo+tasa: "IVA-0.160000" → { base, amount }
    const transferMap = new Map<string, { base: number; type: string; rate: number; amount: number }>();

    for (let conceptIndex = 0; conceptIndex < concepts.length; conceptIndex++) {

        const concept = concepts[conceptIndex];
        const base = round2(concept.unitPrice * concept.quantity);

        for (let taxIndex = 0; taxIndex < concept.taxes.length; taxIndex++) {

            const tax = concept.taxes[taxIndex];
            const amount = round2(base * tax.rate);

            if (tax.withholding) {
                totalRetentions = round2(totalRetentions + amount);
                retentionsXml += `<cfdi:Retencion Impuesto="${getSatTaxCode(tax.type)}" Importe="${amount}"/>`;
            } else {
                // Clave única por tipo e impuesto para consolidar traslados del mismo tipo
                const key = `${tax.type}-${tax.rate.toFixed(6)}`;

                if (transferMap.has(key)) {
                    const existing = transferMap.get(key)!;
                    existing.base = round2(existing.base + base);
                    existing.amount = round2(existing.amount + amount);
                } else {
                    transferMap.set(key, { base, type: tax.type, rate: tax.rate, amount });
                }

                totalTransfers = round2(totalTransfers + amount);
            }
        }
    }

    // Genera XML de traslados consolidados
    let transfersXml = '';
    transferMap.forEach((entry) => {
        transfersXml += `<cfdi:Traslado Base="${entry.base}" Impuesto="${getSatTaxCode(entry.type)}" TipoFactor="Tasa" TasaOCuota="${entry.rate.toFixed(6)}" Importe="${entry.amount}"/>`;
    });

    let retentionsAttribute = '';
    if (totalRetentions > 0) {
        retentionsAttribute = ` TotalImpuestosRetenidos="${totalRetentions}"`;
    }

    let xml = '';
    if (transfersXml) xml += `<cfdi:Traslados>${transfersXml}</cfdi:Traslados>`;
    if (retentionsXml) xml += `<cfdi:Retenciones>${retentionsXml}</cfdi:Retenciones>`;

    return `<cfdi:Impuestos TotalImpuestosTrasladados="${totalTransfers}"${retentionsAttribute}>${xml}</cfdi:Impuestos>`;
}