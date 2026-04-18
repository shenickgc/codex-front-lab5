import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function sanitizeFilenamePart(value) {
  return (value || 'cotizacion')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export function downloadQuotePdf(quote) {
  const doc = new jsPDF();
  const generatedAt = quote.updatedAt || quote.createdAt || new Date().toISOString();

  doc.setFillColor(232, 33, 39);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Cotizacion', 14, 18);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text(`Cliente: ${quote.customerName}`, 14, 40);
  doc.text(`Correo: ${quote.customerEmail || 'No especificado'}`, 14, 47);
  doc.text(`Estado: ${quote.status}`, 14, 54);
  doc.text(`Fecha: ${dateFormatter.format(new Date(generatedAt))}`, 14, 61);

  if (quote.description) {
    doc.text(`Descripcion: ${quote.description}`, 14, 72, { maxWidth: 180 });
  }

  if (quote.notes) {
    doc.text(`Notas: ${quote.notes}`, 14, 82, { maxWidth: 180 });
  }

  autoTable(doc, {
    startY: quote.notes ? 94 : quote.description ? 84 : 72,
    head: [['Concepto', 'Cantidad', 'P. unitario', 'Subtotal']],
    body: quote.items.map((item) => [
      item.name,
      String(item.quantity),
      currencyFormatter.format(item.unitPrice),
      currencyFormatter.format(item.subtotal),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27],
    },
    styles: {
      fontSize: 10,
    },
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.text(`Total: ${currencyFormatter.format(quote.total)}`, 14, finalY);

  const filename = `cotizacion-${sanitizeFilenamePart(quote.customerName)}-${quote._id.slice(-6)}.pdf`;
  doc.save(filename);
}
