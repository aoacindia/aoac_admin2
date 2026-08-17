import { jsPDF } from "jspdf";
import { serializeImportedOrder } from "@/lib/imported-orders";

type OrderForPdf = ReturnType<typeof serializeImportedOrder>;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function buildOrdersPdf(orders: OrderForPdf[]): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Orders", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  doc.text(`Orders in this download: ${orders.length}`, pageWidth - margin, y, {
    align: "right",
  });
  y += 18;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  if (orders.length === 0) {
    doc.text("No orders to download.", margin, y);
  }

  for (const [orderIndex, order] of orders.entries()) {
    ensureSpace(90);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${orderIndex + 1}. ${order.order_name}`, margin, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Order Date: ${formatDate(order.order_date)}`, margin, y);
    y += 14;
    doc.text(`Delivery Charges: ${order.delivery_charges}`, margin, y);
    y += 14;
    doc.text(`Order Total: ${order.order_total}`, margin, y);
    y += 14;
    doc.text(`Number of Items: ${order.item_count}`, margin, y);
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.text("Order Items", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    // Columns: Line | Item Name | Qty | Amount
    // Qty is 1 per line item (schema stores amount per line, not separate quantity).
    doc.setFont("helvetica", "bold");
    doc.text("Line", margin, y);
    doc.text("Item Name", margin + 40, y);
    doc.text("Qty", pageWidth - margin - 120, y);
    doc.text("Amount", pageWidth - margin, y, { align: "right" });
    y += 12;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    for (const item of order.items) {
      ensureSpace(18);
      const nameLines = doc.splitTextToSize(
        item.item_name,
        pageWidth - margin - 180,
      ) as string[];
      doc.text(String(item.line_index), margin, y);
      doc.text(nameLines, margin + 40, y);
      doc.text("1", pageWidth - margin - 120, y);
      doc.text(item.amount, pageWidth - margin, y, { align: "right" });
      y += Math.max(14, nameLines.length * 12);
    }

    y += 10;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
