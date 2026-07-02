// ================================
// CONCEPTS XML
// ================================
import { IConcept } from '../../requests/invoice.request';
import { xmlEscape } from '../../utils/xml-escape.util';
import { round2 } from '../../utils/round2.util';

function buildConceptTaxesXml(concept: IConcept): string {
    const base = round2(concept.unitPrice * concept.quantity);

    let transfers = '';
    let retentions = '';

    for (let taxIndex = 0; taxIndex < concept.taxes.length; taxIndex++) {
        const tax = concept.taxes[taxIndex];
        const amount = round2(base * tax.rate);

        if (tax.withholding) {
            retentions += `<cfdi:Retencion Base="${base}" Impuesto="${tax.type}" TipoFactor="Tasa" TasaOCuota="${tax.rate.toFixed(6)}" Importe="${amount}"/>`;
        } else {
            transfers += `<cfdi:Traslado Base="${base}" Impuesto="${tax.type}" TipoFactor="Tasa" TasaOCuota="${tax.rate.toFixed(6)}" Importe="${amount}"/>`;
        }
    }

    let taxes = '';
    if (transfers) taxes += `<cfdi:Traslados>${transfers}</cfdi:Traslados>`;
    if (retentions) taxes += `<cfdi:Retenciones>${retentions}</cfdi:Retenciones>`;

    return `<cfdi:Impuestos>${taxes}</cfdi:Impuestos>`;
}

// Genera el bloque completo de conceptos — aplica a Ingreso y Egreso
export function buildConceptsXml(concepts: IConcept[]): string {
    let items = '';

    for (let conceptIndex = 0; conceptIndex < concepts.length; conceptIndex++) {
        const concept = concepts[conceptIndex];
        const amount = round2(concept.unitPrice * concept.quantity);

        // ObjetoImp: 01 = No objeto de impuesto, 02 = Objeto de impuesto
        let objetoImp = '01';
        let taxesXml = '';

        if (concept.taxes.length > 0) {
            objetoImp = '02';
            taxesXml = buildConceptTaxesXml(concept);
        }

        items += `<cfdi:Concepto ClaveProdServ="${concept.productKey}" ClaveUnidad="${concept.unitKey}" Descripcion="${xmlEscape(concept.description)}" ValorUnitario="${concept.unitPrice}" Cantidad="${concept.quantity}" Importe="${amount}" ObjetoImp="${objetoImp}">${taxesXml}</cfdi:Concepto>`;
    }

    return `<cfdi:Conceptos>${items}</cfdi:Conceptos>`;
}