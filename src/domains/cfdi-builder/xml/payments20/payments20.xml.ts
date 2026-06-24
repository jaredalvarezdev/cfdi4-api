// ================================
// PAYMENTS20 XML
// ================================
import { IPayment } from '../../requests/payment.request';
import { round2 } from '../../utils/round2.util';

// Genera el complemento de pagos 2.0 — solo aplica para Pago (P)
export function buildPayments20Xml(payments: IPayment[]): string {

    let totales = 0;      // Total de todos los pagos
    let pagosXml = '';    // XML de cada pago

    for (let paymentIndex = 0; paymentIndex < payments.length; paymentIndex++) {

        const payment = payments[paymentIndex];
        totales = round2(totales + payment.amount);

        let docsXml = ''; // XML de documentos relacionados de este pago

        for (let docIndex = 0; docIndex < payment.relatedDocuments.length; docIndex++) {

            const doc = payment.relatedDocuments[docIndex];

            docsXml += `<pago20:DoctoRelacionado IdDocumento="${doc.uuid}" MetodoDePagoDR="${doc.paymentMethod}" NominalDR="${doc.previousBalance}" EquivalenciaDR="1" NumParcialidad="${doc.installmentNumber}" ImpSaldoAnt="${doc.previousBalance}" ImpPagado="${doc.amountPaid}" ImpSaldoInsoluto="${doc.remainingBalance}" MonedaDR="MXN"/>`;
        }

        pagosXml += `<pago20:Pago FechaPago="${payment.paymentDate}" FormaDePagoP="${payment.paymentForm}" MonedaP="${payment.currency}" Monto="${payment.amount}">${docsXml}</pago20:Pago>`;
    }

    return `<pago20:Pagos Version="2.0"><pago20:Totales MontoTotalPagos="${totales}"/>${pagosXml}</pago20:Pagos>`;
}