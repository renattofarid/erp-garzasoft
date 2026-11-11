export interface InvoicePdfLine {
  descripcion: string;
  unidad: string;
  cantidad: number;
  valor_unitario: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  igv: number;
  total: number;
  tipo_igv: string;
}

export interface InvoicePdfData {
  tipoDocumento: "F" | "B";
  serie: string;
  correlativo: string;
  fechaEmision: string;
  rucEmisor: string;
  emisor: string;
  direccionEmisor: string;
  documentoReceptor: string;
  receptor: string;
  direccionReceptor: string;
  moneda: string;
  formaPago: "C" | "D";
  subtotal: number;
  igv: number;
  inafecta: number;
  exonerada: number;
  total: number;
  totalEnLetras: string;
  detalles: InvoicePdfLine[];
}

interface PdfTextItem {
  str: string;
  transform: number[];
  width?: number;
}

interface PositionedText {
  text: string;
  x: number;
  y: number;
  width: number;
}

interface TextLine {
  y: number;
  items: PositionedText[];
  text: string;
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

function parseLocalizedNumber(value: string | undefined): number | null {
  if (!value) return null;
  let normalized = value.replace(/[^\d,.-]/g, "");
  if (!normalized || !/\d/.test(normalized)) return null;

  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized.replace(/,/g, "");
  } else if (comma >= 0) {
    const decimals = normalized.length - comma - 1;
    normalized = decimals === 3 ? normalized.replace(/,/g, "") : normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function linesFromItems(items: PdfTextItem[]): { positioned: PositionedText[]; lines: TextLine[] } {
  const positioned = items
    .filter((item) => item.str?.trim() && item.transform?.length >= 6)
    .map((item) => ({
      text: clean(item.str),
      x: item.transform[4],
      y: item.transform[5],
      width: item.width || 0,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: TextLine[] = [];
  for (const item of positioned) {
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2.5);
    if (!line) {
      line = { y: item.y, items: [], text: "" };
      lines.push(line);
    }
    line.items.push(item);
  }

  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    line.text = clean(line.items.map((item) => item.text).join(" "));
  }

  lines.sort((a, b) => b.y - a.y);
  return { positioned, lines };
}

function valueOnLine(lines: TextLine[], pattern: RegExp, startAt = 0): { value: string; index: number } {
  const index = lines.findIndex((line, lineIndex) => lineIndex >= startAt && pattern.test(line.text));
  if (index < 0) return { value: "", index: -1 };

  const line = lines[index];
  const value = clean(line.text.replace(pattern, ""));
  return { value: value || clean(lines[index + 1]?.text || ""), index };
}

function parseInvoiceDate(text: string): string {
  const match = text.match(/\b(\d{2})[/-](\d{2})[/-](\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (!match) return "";
  if (match[4]) return `${match[4]}-${match[5]}-${match[6]}`;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function amountAfterLabel(text: string, label: RegExp): number | null {
  const remainder = text.replace(label, "");
  const amount = remainder.match(/-?\d[\d.,]*/g)?.at(-1);
  return parseLocalizedNumber(amount);
}

function nearestColumnValue(
  positioned: PositionedText[],
  y: number,
  xMin: number,
  xMax: number
): string {
  return positioned
    .filter((item) => Math.abs(item.y - y) <= 2.5 && item.x >= xMin && item.x < xMax)
    .sort((a, b) => a.x - b.x)[0]?.text || "";
}

export function parseInvoicePdfTextItems(items: PdfTextItem[]): InvoicePdfData {
  const { positioned, lines } = linesFromItems(items);
  const joinedText = lines.map((line) => line.text).join("\n");
  const numberMatch = joinedText.match(/\b([FB]\d{3})\s*[-–]\s*(\d{1,8})\b/i);
  if (!numberMatch) {
    throw new Error("No encontré la serie y el correlativo de la factura en el PDF.");
  }

  const dateField = valueOnLine(lines, /fecha\s*emisi[oó]n\s*:?/i);
  const date = parseInvoiceDate(dateField.value);
  if (!date) throw new Error("No encontré una fecha de emisión válida en el PDF.");

  const receiverStart = dateField.index >= 0 ? dateField.index + 1 : 0;
  const receiverRuc = valueOnLine(lines, /^ruc\s*:?/i, receiverStart).value.match(/\d{8,20}/)?.[0] || "";
  const receiverName = valueOnLine(lines, /^señor(?:\(es\))?\s*:?/i, receiverStart).value;
  const receiverAddress = valueOnLine(lines, /^dirección\s*:?/i, receiverStart).value;
  const currency = valueOnLine(lines, /^moneda\s*:?/i, receiverStart).value.toUpperCase().match(/\b(PEN|USD|EUR)\b/)?.[0] || "PEN";
  const paymentText = valueOnLine(lines, /^forma\s*de\s*pago\s*:?/i, receiverStart).value.toUpperCase();

  const documentNumberIndex = lines.findIndex((line) => /\b[FB]\d{3}\s*[-–]\s*\d{1,8}\b/i.test(line.text));
  const issuerName = documentNumberIndex >= 0 ? lines[documentNumberIndex + 1]?.text || "" : "";
  const issuerAddress = documentNumberIndex >= 0 ? lines[documentNumberIndex + 2]?.text || "" : "";
  const beforeReceiver = lines.slice(0, Math.max(receiverStart, 0)).map((line) => line.text).join("\n");
  const issuerRuc = beforeReceiver.match(/\bRUC\s*:?\s*(\d{8,20})/i)?.[1] || "";

  const totalLine = lines.find((line) => /importe\s*total/i.test(line.text));
  const grossTotal = totalLine ? amountAfterLabel(totalLine.text, /importe\s*total\s*/i) : null;
  if (grossTotal === null) throw new Error("No encontré el importe total de la factura en el PDF.");

  const taxableLine = lines.find((line) => /op\.?\s*gravada/i.test(line.text));
  const igvLine = lines.find((line) => /i\.?\s*g\.?\s*v\.?/i.test(line.text));
  const unaffectedLine = lines.find((line) => /op\.?\s*inafecta/i.test(line.text));
  const exemptLine = lines.find((line) => /op\.?\s*exonerada/i.test(line.text));
  const taxable = taxableLine ? amountAfterLabel(taxableLine.text, /op\.?\s*gravada\s*/i) : null;
  const igv = igvLine ? amountAfterLabel(igvLine.text, /i\.?\s*g\.?\s*v\.?[^\d]*/i) : null;
  const unaffected = unaffectedLine ? amountAfterLabel(unaffectedLine.text, /op\.?\s*inafecta\s*/i) : 0;
  const exempt = exemptLine ? amountAfterLabel(exemptLine.text, /op\.?\s*exonerada\s*/i) : 0;
  const totalInWords = lines.find((line) => /^son\s*:/i.test(line.text))?.text.replace(/^son\s*:\s*/i, "") || "";

  const itemHeader = positioned.find((item) => /^item$/i.test(item.text) && item.x < 100);
  const summaryY = Math.min(...[taxableLine, igvLine, unaffectedLine, exemptLine, totalLine].filter(Boolean).map((line) => line!.y));
  const rowAnchors = itemHeader
    ? positioned
      .filter((item) => /^\d{1,3}$/.test(item.text) && item.x < 75 && item.y < itemHeader.y - 4 && item.y > summaryY)
      .sort((a, b) => b.y - a.y)
    : [];

  const details: InvoicePdfLine[] = rowAnchors.map((anchor, index) => {
    const previousY = index === 0 ? itemHeader!.y : rowAnchors[index - 1].y;
    const nextY = rowAnchors[index + 1]?.y;
    const top = (previousY + anchor.y) / 2 + 2;
    const bottom = nextY !== undefined
      ? (anchor.y + nextY) / 2 - 2
      : anchor.y - Math.max(18, (previousY - anchor.y) / 2) - 2;
    const description = positioned
      .filter((item) => item.x >= 70 && item.x < 288 && item.y <= top && item.y >= bottom)
      .sort((a, b) => b.y - a.y || a.x - b.x)
      .map((item) => item.text)
      .join(" ");

    const unit = nearestColumnValue(positioned, anchor.y, 288, 313);
    const quantity = parseLocalizedNumber(nearestColumnValue(positioned, anchor.y, 313, 360)) || 1;
    const unitValue = parseLocalizedNumber(nearestColumnValue(positioned, anchor.y, 360, 405)) || 0;
    const unitPrice = parseLocalizedNumber(nearestColumnValue(positioned, anchor.y, 405, 446)) || unitValue;
    const discount = parseLocalizedNumber(nearestColumnValue(positioned, anchor.y, 446, 490)) || 0;
    const saleValue = parseLocalizedNumber(nearestColumnValue(positioned, anchor.y, 490, 590)) ?? quantity * unitValue;
    const lineTotal = Math.max(saleValue, quantity * unitPrice - discount);
    const lineIgv = Math.max(0, Number((lineTotal - saleValue).toFixed(2)));

    return {
      descripcion: description.slice(0, 255),
      unidad: unit.slice(0, 8) || "NIU",
      cantidad: quantity,
      valor_unitario: unitValue,
      precio_unitario: unitPrice,
      descuento: discount,
      subtotal: saleValue,
      igv: lineIgv,
      total: lineTotal,
      tipo_igv: lineIgv > 0 ? "10" : (exempt || unaffected ? (exempt ? "20" : "30") : "10"),
    };
  }).filter((detail) => detail.descripcion && detail.subtotal >= 0);

  if (!details.length) throw new Error("Leí los datos de la factura, pero no encontré sus conceptos.");

  return {
    tipoDocumento: numberMatch[1].toUpperCase().startsWith("B") ? "B" : "F",
    serie: numberMatch[1].toUpperCase(),
    correlativo: String(Number(numberMatch[2])),
    fechaEmision: date,
    rucEmisor: issuerRuc,
    emisor: issuerName,
    direccionEmisor: issuerAddress,
    documentoReceptor: receiverRuc,
    receptor: receiverName,
    direccionReceptor: receiverAddress,
    moneda: currency,
    formaPago: /cr[eé]dito/i.test(paymentText) ? "D" : "C",
    subtotal: taxable ?? details.reduce((sum, detail) => sum + detail.subtotal, 0),
    igv: igv ?? details.reduce((sum, detail) => sum + detail.igv, 0),
    inafecta: unaffected ?? 0,
    exonerada: exempt ?? 0,
    total: grossTotal,
    totalEnLetras: totalInWords,
    detalles: details,
  };
}

export async function extractInvoicePdf(file: File): Promise<InvoicePdfData> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const document = await loadingTask.promise;
  try {
    const textItems: PdfTextItem[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      textItems.push(...content.items
        .filter((item) => typeof (item as PdfTextItem).str === "string" && Array.isArray((item as PdfTextItem).transform))
        .map((item) => item as PdfTextItem));
    }
    return parseInvoicePdfTextItems(textItems);
  } finally {
    await loadingTask.destroy();
  }
}
