import { jsPDF } from "jspdf";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatting";

export interface InvoicePdfOptions {
  cashierName?: string;
  paymentMethod?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

export function generateInvoicePdf(invoice: Invoice, options?: InvoicePdfOptions) {
  const clinicName = options?.clinicName || "OKAY DENTAL THERAPIST";
  const clinicAddress = options?.clinicAddress || "Ds. Krajan II RT.08 RW.02 67276";
  const clinicPhone = options?.clinicPhone || "083856480982";
  const cashierName = options?.cashierName || "Kasir Dental Care";
  const paymentMethod = options?.paymentMethod || "Tunai (Cash)";

  // Format A5 Portrait (148 x 210 mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  const pageWidth = 148;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 128 mm

  // 1. Header Banner Background Accents (Clean Sky Blue Box)
  doc.setFillColor(240, 249, 255); // sky-50
  doc.rect(margin, 8, contentWidth, 22, "F");

  // Prominent Blue Accent Line under top banner
  doc.setDrawColor(2, 132, 199); // sky-600
  doc.setLineWidth(1.0);
  doc.line(margin, 30, pageWidth - margin, 30);

  // Clinic Title & Contact
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(clinicName, margin + 4, 15.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(clinicAddress, margin + 4, 21);
  doc.text(clinicPhone, margin + 4, 26);

  // Status Badge on top-right (LUNAS vs UANG MUKA DP)
  const isPendingDp = invoice.balanceAmount > 0;
  if (isPendingDp) {
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(2, 132, 199); // sky-600
    doc.setLineWidth(0.4);
    doc.roundedRect(pageWidth - margin - 35, 12, 31, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text("DP TERBAYAR", pageWidth - margin - 19.5, 17.2, { align: "center" });
  } else {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(34, 197, 94); // emerald-500
    doc.setLineWidth(0.4);
    doc.roundedRect(pageWidth - margin - 29, 12, 25, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74); // emerald-600
    doc.text("LUNAS (PAID)", pageWidth - margin - 16.5, 17.2, { align: "center" });
  }

  // 2. Document Title
  let curY = 36.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  const docTitle = isPendingDp
    ? "BUKTI PENERIMAAN UANG MUKA (DP)"
    : ((invoice.transactions && invoice.transactions.length > 1) || (invoice.dpAmount && invoice.dpAmount > 0)
        ? "KUITANSI PELUNASAN RESMI"
        : "BUKTI PEMBAYARAN & NOTA KASIR");
  doc.text(docTitle, margin, curY);

  curY += 5;
  // Metadata 2-Column Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, contentWidth, 23, 2, 2, "FD");

  const col1X = margin + 3.5;
  const col2X = margin + contentWidth / 2 + 3.5;
  const metaY = curY + 5;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500

  // Left Column
  doc.text("No. Invoice:", col1X, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 132, 199);
  doc.text(invoice.invoiceNumber, col1X + 24, metaY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Tanggal Transaksi:", col1X, metaY + 5.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(invoice.invoiceDate), col1X + 24, metaY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Kasir / Petugas:", col1X, metaY + 11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(cashierName, col1X + 24, metaY + 11);

  // Right Column
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Nama Pasien:", col2X, metaY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patientName, col2X + 24, metaY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("No. Rekam Medis:", col2X, metaY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patientMrn, col2X + 24, metaY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Metode Bayar:", col2X, metaY + 11);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.setFont("helvetica", "bold");
  doc.text(paymentMethod, col2X + 24, metaY + 11);

  curY += 27;

  // 3. Table Header
  const colW = {
    no: 8,
    desc: 62,
    qty: 12,
    price: 23,
    total: 23,
  };
  const thY = curY;
  const thH = 6;

  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, thY, contentWidth, thH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  doc.text("No", curX + 2, thY + 4.2);
  curX += colW.no;
  doc.text("Layanan & Tindakan Gigi", curX + 2, thY + 4.2);
  curX += colW.desc;
  doc.text("Qty", curX + colW.qty / 2, thY + 4.2, { align: "center" });
  curX += colW.qty;
  doc.text("Tarif", curX + colW.price - 2, thY + 4.2, { align: "right" });
  curX += colW.price;
  doc.text("Subtotal", curX + colW.total - 2, thY + 4.2, { align: "right" });

  curY += thH;

  // 4. Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  invoice.items.forEach((it, idx) => {
    const isEven = idx % 2 === 0;
    const rowH = 6.5;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, curY, contentWidth, rowH, "F");

    // Bottom subtle border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, curY + rowH, margin + contentWidth, curY + rowH);

    doc.setTextColor(51, 65, 85);
    let x = margin;
    doc.text(String(idx + 1), x + 2, curY + 4.5);
    x += colW.no;

    // Truncate description if too long
    const descText = doc.splitTextToSize(it.description, colW.desc - 4);
    doc.text(descText[0] || it.description, x + 2, curY + 4.5);
    x += colW.desc;

    doc.text(String(it.quantity), x + colW.qty / 2, curY + 4.5, { align: "center" });
    x += colW.qty;

    doc.text(formatCurrency(it.unitPrice), x + colW.price - 2, curY + 4.5, { align: "right" });
    x += colW.price;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(it.totalPrice), x + colW.total - 2, curY + 4.5, { align: "right" });
    doc.setFont("helvetica", "normal");

    curY += rowH;
  });

  // 5. Financial Summary (Right-aligned Box)
  curY += 2;
  const summaryW = 60;
  const summaryX = margin + contentWidth - summaryW;

  const addSummaryRow = (label: string, value: string, isBold = false, color = [15, 23, 42]) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 8.5 : 7.5);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(label, summaryX, curY);
    doc.text(value, margin + contentWidth - 2, curY, { align: "right" });
    curY += isBold ? 5.5 : 4.5;
  };

  addSummaryRow("Subtotal Tindakan:", formatCurrency(invoice.subtotal));

  if (invoice.insuranceCoverage > 0) {
    addSummaryRow("Jaminan Asuransi / BPJS:", `- ${formatCurrency(invoice.insuranceCoverage)}`, false, [13, 148, 136]);
  }
  if (invoice.discount > 0) {
    addSummaryRow("Diskon Klinik:", `- ${formatCurrency(invoice.discount)}`, false, [16, 185, 129]);
  }

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(summaryX, curY - 1, margin + contentWidth, curY - 1);

  addSummaryRow("TOTAL TAGIHAN:", formatCurrency(invoice.totalAmount), true, [2, 132, 199]);

  const hasDpHistory = (invoice.transactions && invoice.transactions.length > 1) || (invoice.dpAmount && invoice.dpAmount > 0);
  const dpAmount = invoice.dpAmount || (invoice.transactions && invoice.transactions[0]?.amount) || 0;

  if (isPendingDp) {
    addSummaryRow(`Uang Muka / DP (${paymentMethod}):`, formatCurrency(invoice.paidAmount), true, [14, 165, 233]);
    addSummaryRow("SISA PELUNASAN:", `${formatCurrency(invoice.balanceAmount)} (BELUM LUNAS)`, true, [225, 29, 72]);
  } else if (hasDpHistory && dpAmount > 0) {
    addSummaryRow("Uang Muka (DP) Sebelumnya:", formatCurrency(dpAmount), false, [71, 85, 105]);
    addSummaryRow(`Pelunasan Sisa (${paymentMethod}):`, formatCurrency(invoice.totalAmount - dpAmount), true, [16, 185, 129]);
    addSummaryRow("Sisa Tagihan:", "Rp 0 (LUNAS)", true, [16, 185, 129]);
  } else {
    addSummaryRow(`Dibayar (${paymentMethod}):`, formatCurrency(invoice.paidAmount || invoice.totalAmount), true, [16, 185, 129]);
    addSummaryRow("Sisa Tagihan:", "Rp 0 (LUNAS)", false, [71, 85, 105]);
  }

  // Tendered amount & Change calculation
  const lastTrx = invoice.transactions && invoice.transactions.length > 0
    ? invoice.transactions[invoice.transactions.length - 1]
    : null;
  const tenderedVal = lastTrx?.tenderedAmount || invoice.tenderedAmount;
  const changeVal = lastTrx?.changeAmount ?? invoice.changeAmount;

  if (tenderedVal && tenderedVal > 0) {
    addSummaryRow(`Uang Diterima (${paymentMethod}):`, formatCurrency(tenderedVal), false, [51, 65, 85]);
    addSummaryRow("Kembalian:", formatCurrency(changeVal || 0), true, [16, 185, 129]);
  }

  // 6. Guarantee & Thank You Footer
  curY = Math.max(curY + 4, 180);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(margin, curY, margin + contentWidth, curY);
  doc.setLineDashPattern([], 0);

  curY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("Terima kasih atas kunjungan Anda di " + clinicName + "!", pageWidth / 2, curY, { align: "center" });

  curY += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Semoga senyum sehat & ceria selalu menyertai Anda dan keluarga. 🙏🦷", pageWidth / 2, curY, { align: "center" });

  curY += 3.5;
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("*** Simpan dokumen PDF ini sebagai bukti transaksi dan pembayaran sah ***", pageWidth / 2, curY, { align: "center" });

  // Output utilities
  const getBase64 = (): string => {
    return doc.output("datauristring");
  };

  const download = (fileName?: string) => {
    doc.save(fileName || `Nota_${invoice.invoiceNumber}.pdf`);
  };

  return {
    doc,
    getBase64,
    download,
  };
}
