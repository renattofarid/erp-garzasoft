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
 * Safely extracts embedded images with timeouts to prevent hanging
 */
async function extractImagesFromPdfPage(page: any): Promise<{ dataUrl: string; width: number; height: number }[]> {
  const images: { dataUrl: string; width: number; height: number }[] = [];

  try {
    const ops = await Promise.race([
      page.getOperatorList(),
      new Promise<null>((r) => setTimeout(() => r(null), 1000)),
    ]);
    if (!ops) return images;

    const imageNames: string[] = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (
        fn === pdfjsLib.OPS.paintImageXObject ||
        fn === pdfjsLib.OPS.paintInlineImageXObject ||
        fn === pdfjsLib.OPS.paintImageMaskXObject
      ) {
        const arg = ops.argsArray[i][0];
        if (typeof arg === "string" && !imageNames.includes(arg)) {
          imageNames.push(arg);
        }
      }
    }

    for (const imgName of imageNames) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 300); // 300ms safety timeout to prevent hanging

        try {
          if (page.objs && page.objs.has && page.objs.has(imgName)) {
            page.objs.get(imgName, (imgObj: any) => {
              clearTimeout(timer);
              if (imgObj && imgObj.data && imgObj.width && imgObj.height) {
                try {
                  const canvas = document.createElement("canvas");
                  canvas.width = imgObj.width;
                  canvas.height = imgObj.height;
                  const ctx = canvas.getContext("2d");

                  if (ctx) {
                    const imgData = ctx.createImageData(imgObj.width, imgObj.height);
                    const data = imgObj.data;

                    if (data.length === imgObj.width * imgObj.height * 4) {
                      imgData.data.set(data);
                    } else if (data.length === imgObj.width * imgObj.height * 3) {
                      for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
                        imgData.data[q] = data[p];
                        imgData.data[q + 1] = data[p + 1];
                        imgData.data[q + 2] = data[p + 2];
                        imgData.data[q + 3] = 255;
                      }
                    } else if (data.length === imgObj.width * imgObj.height) {
                      for (let p = 0, q = 0; p < data.length; p++, q += 4) {
                        const val = data[p];
                        imgData.data[q] = val;
                        imgData.data[q + 1] = val;
                        imgData.data[q + 2] = val;
                        imgData.data[q + 3] = 255;
                      }
                    }

                    ctx.putImageData(imgData, 0, 0);
                    images.push({
                      dataUrl: canvas.toDataURL("image/png"),
                      width: imgObj.width,
                      height: imgObj.height,
                    });
                  }
                } catch (e) {
                  console.warn("Canvas image render error:", e);
                }
              }
              resolve();
            });
          } else {
            clearTimeout(timer);
            resolve();
          }
        } catch {
          clearTimeout(timer);
          resolve();
        }
      });
    }
  } catch (err) {
    console.warn("Operator list image extraction error:", err);
  }

  return images;
}

/**
 * Intelligent PDF Parser for Gesrest Formato de Alta.
 * - Extracts images (watermarks, logos, screenshots, signatures) safely without hanging.
 * - Extracts unified 2-column tables with full question titles inside table cells.
 * - Generates 100% editable HTML pages.
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

    // 1. Extract embedded images safely
    const extractedImages = await extractImagesFromPdfPage(page);

    let watermarkHtml = "";
    const inlineImagesHtml: string[] = [];

    extractedImages.forEach((img) => {
      if (img.width > 350 && img.height > 350 && !watermarkHtml) {
        watermarkHtml = `
<div style="position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); opacity: 0.12; pointer-events: none; z-index: 0; text-align: center; width: 100%;">
  <img src="${img.dataUrl}" alt="Fondo Watermark" style="max-width: 80%; height: auto; margin: 0 auto; display: block;" />
</div>
`;
      } else {
        inlineImagesHtml.push(`
<div style="text-align: center; margin: 12px 0;">
  <img src="${img.dataUrl}" alt="Imagen PDF" style="max-width: 100%; max-height: 280px; height: auto; margin: 0 auto; display: block; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);" />
</div>
`);
      }
    });

    // 2. Extract text items
    const textContent = await page.getTextContent();
    const items: RawTextItem[] = [];

    for (const rawItem of textContent.items as any[]) {
      if (!rawItem.str || rawItem.str.trim().length === 0) continue;

      const transform = rawItem.transform;
      const x = transform[4];
      const y = pageHeight - transform[5]; // Invert Y (0 at top)
      const fontSize = Math.round(
        Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1])
      );

      items.push({
        str: rawItem.str.trim(),
        x: Math.round(x),
        y: Math.round(y),
        fontSize: fontSize || 12,
        width: Math.round(rawItem.width || 0),
      });
    }

    // 3. Sort items by Y (top to bottom), then by X (left to right)
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

    // 4. Filter out repeated page numbers / footer strings
    const filteredItems = items.filter((it) => {
      const s = it.str.toLowerCase();
      if (s === "un producto de mr. soft" || s.startsWith("un producto")) return false;
      if (/^\d+\s*\/\s*\d+$/.test(it.str) || (/^\d+$/.test(it.str) && it.y > pageHeight - 60)) {
        return false;
      }
      return true;
    });

    // Header Logo in top right
    const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 20px; clear: right;">
  <span style="font-size: 15px; font-weight: 700; color: #eb5454;">Gesrest</span><br>
  <span style="font-size: 9.5px; color: #888;">Tu restaurante digital</span>
</div>
<div style="clear: both;"></div>
`;

    // 5. Check if page contains video tutorial links
    const urlItems = filteredItems.filter(
      (it) =>
        it.str.includes("https://") ||
        it.str.includes("http://") ||
        it.str.includes("youtu.be")
    );

    if (urlItems.length > 0) {
      // PAGE WITH VIDEO TUTORIALS OR 2-COLUMN TABLE
      const nonTableElements: string[] = [];
      const tableRows: { question: string; url: string }[] = [];

      const firstUrlY = urlItems[0].y;
      let firstTableItemY = firstUrlY;

      for (const it of filteredItems) {
        if (it.y <= firstUrlY && (it.str.startsWith("¿") || it.str.startsWith("Recorrido") || it.str.startsWith("Presentación") || it.str.startsWith("Tutorial"))) {
          firstTableItemY = Math.min(firstTableItemY, it.y);
          break;
        }
      }

      const headerTokens: string[] = [];
      filteredItems.forEach((it) => {
        if (it.y < firstTableItemY - 15 && !it.str.includes("http")) {
          headerTokens.push(it.str);
        }
      });

      if (headerTokens.length > 0) {
        const headerText = headerTokens.join(" ");
        if (headerText.includes("TUTORIALES")) {
          nonTableElements.push(
            `<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 0 0 12px 0;">TUTORIALES PARA USO DE GESREST</h2>`
          );
        }
        if (headerText.includes("YouTube")) {
          nonTableElements.push(
            `<p style="font-size: 11.5px; line-height: 1.5; margin-bottom: 12px; color: #333;">En la plataforma YouTube en el canal oficial de <strong>Mr. Soft</strong> encontrarás vídeos que explican las pantallas y la funcionalidad de nuestra plataforma GESREST.<br>De esta manera te ayudamos a lograr un mejor aprovechamiento de nuestra plataforma:</p>`
          );
        }
      }

      for (let uIdx = 0; uIdx < urlItems.length; uIdx++) {
        const currUrl = urlItems[uIdx];
        const prevUrlY = uIdx > 0 ? urlItems[uIdx - 1].y : firstTableItemY - 10;
        const nextUrlY = uIdx < urlItems.length - 1 ? urlItems[uIdx + 1].y : pageHeight;

        const qTokens: string[] = [];
        filteredItems.forEach((it) => {
          if (it.x < 240 && it.y > prevUrlY + 4 && it.y <= (uIdx === urlItems.length - 1 ? nextUrlY : currUrl.y + 20)) {
            if (it.str !== "Tutorial" && it.str !== "Enlace" && !it.str.includes("TUTORIALES")) {
              qTokens.push(it.str);
            }
          }
        });

        let questionTitle = qTokens.join(" ").trim();
        questionTitle = questionTitle.replace(/\s+/g, " ");

        if (!questionTitle) {
          questionTitle = `Tutorial ${uIdx + 1}`;
        }

        tableRows.push({
          question: questionTitle,
          url: currUrl.str,
        });
      }

      let tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11.5px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #eb5454; color: #ffffff; font-weight: bold;">
      <th style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #ffffff; font-size: 12px;">Tutorial</th>
      <th style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; color: #ffffff; font-size: 12px;">Enlace</th>
    </tr>
  </thead>
  <tbody>
`;

      tableRows.forEach((row, idx) => {
        const bg = idx % 2 === 1 ? "background-color: #fafafa;" : "background-color: #ffffff;";
        tableHtml += `
    <tr style="${bg}">
      <td style="width: 45%; padding: 8px 12px; border: 1px solid #d1d5db; vertical-align: middle; font-size: 11.5px; font-weight: 500; color: #111827; text-align: left; line-height: 1.45;">
        ${escapeHtml(row.question)}
      </td>
      <td style="width: 55%; padding: 8px 12px; border: 1px solid #d1d5db; vertical-align: middle; font-size: 11.5px; text-align: left;">
        <a href="${row.url}" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;">
          ${escapeHtml(row.url)}
        </a>
      </td>
    </tr>
`;
      });

      tableHtml += `
  </tbody>
</table>
`;

      const finalHtml =
        watermarkHtml +
        headerLogoHtml +
        inlineImagesHtml.join("\n") +
        nonTableElements.join("\n") +
        tableHtml;
      pages.push(finalHtml);
      continue;
    }

    // NON-TUTORIAL PAGES (Cover, Presentation, Credentials, etc.)
    const rawLines: string[] = [];
    let currentTokens: string[] = [];
    let lastY = -1;

    for (const item of filteredItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) <= 5) {
        currentTokens.push(item.str);
        lastY = item.y;
      } else {
        if (currentTokens.length > 0) rawLines.push(currentTokens.join(" "));
        currentTokens = [item.str];
        lastY = item.y;
      }
    }
    if (currentTokens.length > 0) rawLines.push(currentTokens.join(" "));

    let pageContentHtml = "";

    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed === trimmed.toUpperCase() && trimmed.length > 4 && !trimmed.includes("@") && !trimmed.includes("+51")) {
        pageContentHtml += `<h2 style="color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 16px 0 8px 0;">${escapeHtml(trimmed)}</h2>\n`;
      } else if (trimmed.startsWith("•") || trimmed.startsWith("(*)")) {
        pageContentHtml += `<ul style="margin: 3px 0 3px 20px; padding: 0;"><li style="font-size: 12px; line-height: 1.55;">${escapeHtml(trimmed.replace(/^[•(*)\s]+/, ""))}</li></ul>\n`;
      } else {
        let formatted = escapeHtml(trimmed);
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        formatted = formatted.replace(
          urlRegex,
          (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;">${url}</a>`
        );
        pageContentHtml += `<p style="margin: 0 0 6px 0; font-size: 12px; line-height: 1.55;">${formatted}</p>\n`;
      }
    });

    const finalHtml =
      watermarkHtml +
      headerLogoHtml +
      inlineImagesHtml.join("\n") +
      pageContentHtml;

    pages.push(finalHtml);
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
