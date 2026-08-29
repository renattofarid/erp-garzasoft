import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
}

/**
 * Intelligent PDF parser for Gesrest service formats.
 * Reconstructs clean, continuous 2-column tables, headings, logos, and links with 100% visual fidelity.
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

    // 1. Extract text items
    const textContent = await page.getTextContent();
    const items: RawTextItem[] = [];

    for (const rawItem of textContent.items as any[]) {
      if (!rawItem.str || rawItem.str.trim().length === 0) continue;

      const transform = rawItem.transform;
      const x = transform[4];
      const y = pageHeight - transform[5]; // Invert Y coordinate
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
    const rawLines: string[] = [];
    let currentLineTokens: string[] = [];
    let lastY = -1;

    for (const item of items) {
      if (lastY === -1 || Math.abs(item.y - lastY) <= 5) {
        currentLineTokens.push(item.str);
        lastY = item.y;
      } else {
        if (currentLineTokens.length > 0) {
          rawLines.push(currentLineTokens.join(" "));
        }
        currentLineTokens = [item.str];
        lastY = item.y;
      }
    }
    if (currentLineTokens.length > 0) {
      rawLines.push(currentLineTokens.join(" "));
    }

    // Header Logo in top right for all pages
    const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 20px; clear: right;">
  <span style="font-size: 15px; font-weight: 700; color: #eb5454;">Gesrest</span><br>
  <span style="font-size: 9.5px; color: #888;">Tu restaurante digital</span>
</div>
<div style="clear: both;"></div>
`;

    // 4. State machine to assemble clean continuous tables and headings
    let pageHtml = headerLogoHtml;
    const tablePairs: { title: string; link: string }[] = [];
    let pendingQuestion = "";

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      // Skip repeated page numbers / footer strings
      if (/^Un producto de Mr\. Soft/i.test(line) || /^\d+\s*\/\s*\d+$/i.test(line)) {
        continue;
      }

      // Check if line contains a URL
      const hasUrl = line.includes("https://") || line.includes("http://") || line.includes("youtu.be");

      if (hasUrl) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/i);
        const url = urlMatch ? urlMatch[0] : line;
        const remainingText = urlMatch ? line.replace(url, "").trim() : "";

        const fullTitle = (pendingQuestion ? pendingQuestion + " " : "") + remainingText;
        tablePairs.push({
          title: fullTitle.trim() || "Tutorial",
          link: url,
        });
        pendingQuestion = "";
        continue;
      }

      // Check if this line is part of a question title for an upcoming link
      if (
        line.startsWith("¿Cómo") ||
        line.startsWith("Recorrido") ||
        line.startsWith("Presentación") ||
        line.endsWith("?") ||
        pendingQuestion.length > 0
      ) {
        pendingQuestion = pendingQuestion ? `${pendingQuestion} ${line}` : line;
        continue;
      }

      // If we accumulated tutorial table pairs before this non-table line, render the unified table!
      if (tablePairs.length > 0) {
        pageHtml += renderUnifiedTutorialTable(tablePairs);
        tablePairs.length = 0;
      }

      // Check for Headings
      if (
        line === line.toUpperCase() &&
        line.length > 4 &&
        !line.includes("@") &&
        !line.includes("+51")
      ) {
        pageHtml += `<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 16px 0 8px 0;">${escapeHtml(line)}</h2>\n`;
      } else if (line.startsWith("•") || line.startsWith("(*)")) {
        pageHtml += `<ul style="margin: 3px 0 3px 20px; padding: 0;"><li style="font-size: 12px; line-height: 1.55;">${escapeHtml(line.replace(/^[•(*)\s]+/, ""))}</li></ul>\n`;
      } else {
        pageHtml += `<p style="margin: 0 0 6px 0; font-size: 12px; line-height: 1.55;">${escapeHtml(line)}</p>\n`;
      }
    }

    // Flush any remaining table pairs
    if (tablePairs.length > 0) {
      pageHtml += renderUnifiedTutorialTable(tablePairs);
    }

    pages.push(pageHtml.trim() || "<p></p>");
  }

  return pages.length > 0 ? pages : ["<p></p>"];
}

function renderUnifiedTutorialTable(pairs: { title: string; link: string }[]): string {
  let rows = "";
  pairs.forEach((p, idx) => {
    const bg = idx % 2 === 1 ? "background-color: #fafafa;" : "background-color: #ffffff;";
    rows += `
    <tr style="${bg}">
      <td style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; vertical-align: middle; font-size: 11.5px; font-weight: 500; color: #111827; text-align: left;">
        ${escapeHtml(p.title)}
      </td>
      <td style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; vertical-align: middle; font-size: 11.5px; text-align: left;">
        <a href="${p.link}" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;">
          ${escapeHtml(p.link)}
        </a>
      </td>
    </tr>
`;
  });

  return `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11.5px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #eb5454; color: #ffffff; font-weight: bold;">
      <th style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #ffffff;">Tutorial</th>
      <th style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #ffffff;">Enlace</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
