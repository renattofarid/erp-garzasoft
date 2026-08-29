import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface TextItemObj {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
}

/**
 * Intelligent PDF to Editable HTML Parser.
 * - Extracts text blocks, lines, tables, and hyperlinks directly from PDF streams.
 * - Converts PDF table rows (multi-column aligned text) into <table><tr><td>...</td></tr></table>.
 * - Converts YouTube / web links into clickable <a href="..."> elements in coral color.
 * - Detects headings, titles, bullet lists, and paragraphs.
 * - Produces 100% editable HTML text and tables for each physical A4 page.
 */
export async function parsePdfFileToPages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;

    // 1. Extract text items with X, Y coordinates and font size
    const textContent = await page.getTextContent();
    const items: TextItemObj[] = [];

    for (const rawItem of textContent.items as any[]) {
      if (!rawItem.str || rawItem.str.trim().length === 0) continue;

      const transform = rawItem.transform;
      const x = transform[4];
      const y = pageHeight - transform[5]; // Invert Y so 0 is at top
      const fontSize = Math.round(Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]));

      items.push({
        str: rawItem.str.trim(),
        x: Math.round(x),
        y: Math.round(y),
        fontSize: fontSize || 12,
        width: Math.round(rawItem.width || 0),
      });
    }

    // 2. Sort items by Y (top to bottom), then by X (left to right)
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

    // 3. Group items into lines
    const lines: TextItemObj[][] = [];
    let currentLine: TextItemObj[] = [];
    let lastY = -1;

    for (const item of items) {
      if (lastY === -1 || Math.abs(item.y - lastY) <= 5) {
        currentLine.push(item);
        lastY = item.y;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [item];
        lastY = item.y;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // 4. Convert lines into structured HTML (Tables, Headings, Paragraphs, Links)
    let pageHtml = "";
    let inTable = false;
    let tableRowsHtml = "";
    let isHeaderRow = true;

    const closeTableIfNeeded = () => {
      if (inTable) {
        pageHtml += `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11.5px; border: 1px solid #d1d5db;">
  <tbody>
    ${tableRowsHtml}
  </tbody>
</table>
`;
        inTable = false;
        tableRowsHtml = "";
        isHeaderRow = true;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fullLineText = line.map((item) => item.str).join(" ");

      // Check if line is a 2-column table row (e.g. Tutorial | Link, or Usuario | Clave, or Question | Link)
      const hasTwoColumns =
        (line.length >= 2 && line[1].x - line[0].x > 140) ||
        fullLineText.includes("https://") ||
        fullLineText.includes("youtu.be");

      if (hasTwoColumns) {
        if (!inTable) {
          inTable = true;
          isHeaderRow = true;
        }

        let col1 = "";
        let col2 = "";

        if (line.length >= 2) {
          col1 = line[0].str;
          col2 = line.slice(1).map((it) => it.str).join(" ");
        } else {
          // Single line with URL inside
          const urlMatch = fullLineText.match(/(https?:\/\/[^\s]+)/i);
          if (urlMatch) {
            col2 = urlMatch[0];
            col1 = fullLineText.replace(col2, "").trim();
          } else {
            col1 = fullLineText;
          }
        }

        // Format col2 if it's a URL
        if (col2.startsWith("http://") || col2.startsWith("https://")) {
          col2 = `<a href="${col2}" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;">${col2}</a>`;
        }

        // Check if header row (e.g. Usuario | Clave, Tutorial | Enlace, etc.)
        const isHeader =
          isHeaderRow &&
          (col1.toLowerCase().includes("usuario") ||
            col1.toLowerCase().includes("tutorial") ||
            col1.toLowerCase().includes("serie") ||
            col1.toLowerCase().includes("plataforma"));

        if (isHeader) {
          tableRowsHtml += `
<tr style="background-color: #eb5454; color: #ffffff; font-weight: bold;">
  <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; width: 45%; color: #ffffff;">${col1 || "&nbsp;"}</th>
  <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; width: 55%; color: #ffffff;">${col2 || "&nbsp;"}</th>
</tr>
`;
          isHeaderRow = false;
        } else {
          isHeaderRow = false;
          tableRowsHtml += `
<tr style="background-color: #ffffff;">
  <td style="padding: 7px 10px; border: 1px solid #d1d5db; vertical-align: middle; width: 45%; font-size: 11.5px; color: #111827;">${col1 || "&nbsp;"}</td>
  <td style="padding: 7px 10px; border: 1px solid #d1d5db; vertical-align: middle; width: 55%; font-size: 11.5px;">${col2 || "&nbsp;"}</td>
</tr>
`;
        }
        continue;
      }

      // Not a table row: close any open table
      closeTableIfNeeded();

      // Check for Headings (Larger font or uppercase titles)
      const isTitle = line[0].fontSize >= 16;
      const isHeading =
        line[0].fontSize >= 13 ||
        fullLineText === fullLineText.toUpperCase() && fullLineText.length > 5;

      if (isTitle) {
        pageHtml += `<h1 style="color: #eb5454; font-size: 20px; font-weight: 700; margin: 14px 0 8px 0; line-height: 1.25;">${escapeHtml(fullLineText)}</h1>\n`;
      } else if (isHeading) {
        pageHtml += `<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 16px 0 6px 0;">${escapeHtml(fullLineText)}</h2>\n`;
      } else if (
        fullLineText.startsWith("•") ||
        fullLineText.startsWith("(*)") ||
        fullLineText.startsWith("-")
      ) {
        pageHtml += `<ul style="margin: 4px 0 4px 20px; padding: 0;"><li style="font-size: 12.5px; line-height: 1.55; color: #111827;">${escapeHtml(fullLineText.replace(/^[•(*)\-\s]+/, ""))}</li></ul>\n`;
      } else {
        // Regular paragraph with link formatting if present
        let formattedPara = escapeHtml(fullLineText);
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        formattedPara = formattedPara.replace(
          urlRegex,
          (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;">${url}</a>`
        );

        pageHtml += `<p style="margin: 0 0 8px 0; line-height: 1.55; font-size: 12.5px; color: #111827;">${formattedPara}</p>\n`;
      }
    }

    closeTableIfNeeded();

    pages.push(pageHtml.trim() || "<p></p>");
  }

  return pages.length > 0 ? pages : ["<p></p>"];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
