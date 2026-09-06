import mammoth from "mammoth";
import JSZip from "jszip";
import {
  cleanHtmlPageContent,
  isPageEmpty,
  paginateHtmlByA4Height,
} from "./a4Paginator";

interface CellMeta {
  bg: string;
  color: string;
  bold: boolean;
  align: string;
}

/**
 * Gets image natural dimensions asynchronously
 */
function getImageDimensions(src: string): Promise<{ src: string; width: number; height: number; aspect: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 100;
      const h = img.naturalHeight || 100;
      resolve({ src, width: w, height: h, aspect: w / h });
    };
    img.onerror = () => resolve({ src, width: 100, height: 100, aspect: 1 });
    img.src = src;
  });
}

/**
 * Automatically trims white and transparent borders around logos
 * so they have a clean, tight rectangular bounding box identical to Word.
 */
function trimImageWhiteBorders(src: string): Promise<string> {
  return new Promise((resolve) => {
    if (!src || !src.startsWith("data:image")) {
      resolve(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imgData;

        let top = 0;
        let bottom = height;
        let left = 0;
        let right = width;

        for (let y = 0; y < height; y++) {
          let hasColor = false;
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a > 20 && (r < 245 || g < 245 || b < 245)) {
              hasColor = true;
              break;
            }
          }
          if (hasColor) {
            top = y;
            break;
          }
        }

        for (let y = height - 1; y >= 0; y--) {
          let hasColor = false;
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a > 20 && (r < 245 || g < 245 || b < 245)) {
              hasColor = true;
              break;
            }
          }
          if (hasColor) {
            bottom = y + 1;
            break;
          }
        }

        for (let x = 0; x < width; x++) {
          let hasColor = false;
          for (let y = top; y < bottom; y++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a > 20 && (r < 245 || g < 245 || b < 245)) {
              hasColor = true;
              break;
            }
          }
          if (hasColor) {
            left = x;
            break;
          }
        }

        for (let x = width - 1; x >= 0; x--) {
          let hasColor = false;
          for (let y = top; y < bottom; y++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a > 20 && (r < 245 || g < 245 || b < 245)) {
              hasColor = true;
              break;
            }
          }
          if (hasColor) {
            right = x + 1;
            break;
          }
        }

        const cropWidth = Math.max(1, right - left);
        const cropHeight = Math.max(1, bottom - top);

        if (cropWidth >= width - 4 && cropHeight >= height - 4) {
          resolve(src);
          return;
        }

        const trimmedCanvas = document.createElement("canvas");
        trimmedCanvas.width = cropWidth;
        trimmedCanvas.height = cropHeight;
        const trimmedCtx = trimmedCanvas.getContext("2d");
        if (!trimmedCtx) {
          resolve(src);
          return;
        }
        trimmedCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        resolve(trimmedCanvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Auto-trim error:", err);
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

/**
 * Pre-renders Gesrest G watermark onto A4 canvas
 */
function createGesrestA4CoverBackground(watermarkSrc: string): Promise<string> {
  return new Promise((resolve) => {
    if (!watermarkSrc) {
      resolve("");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 794;
        canvas.height = 1123;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(watermarkSrc);
          return;
        }
        const drawWidth = 1750;
        const drawHeight = 1750;
        const drawX = -650;
        const drawY = -270;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Canvas cover background error:", err);
        resolve(watermarkSrc);
      }
    };
    img.onerror = () => resolve(watermarkSrc);
    img.src = watermarkSrc;
  });
}

/**
 * Pre-renders HotelHUB cyan H watermark onto A4 canvas
 */
function createHotelhubA4CoverBackground(watermarkSrc?: string): Promise<string> {
  return new Promise((resolve) => {
    if (watermarkSrc && watermarkSrc.startsWith("data:image")) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 794;
          canvas.height = 1123;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(watermarkSrc);
            return;
          }
          const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
          const drawHeight = 1123;
          const drawWidth = drawHeight * aspect;
          // Shift cyan H watermark to left (-130px) so left loop bleeds off left edge of A4 cover
          const drawX = -130;
          ctx.drawImage(img, drawX, 0, drawWidth, drawHeight);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(watermarkSrc);
        }
      };
      img.onerror = () => resolve(createHotelhubHWatermarkCanvas());
      img.src = watermarkSrc;
    } else {
      resolve(createHotelhubHWatermarkCanvas());
    }
  });
}

/**
 * Generates smooth cyan H watermark canvas for HotelHUB cover
 */
function createHotelhubHWatermarkCanvas(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 794;
    canvas.height = 1123;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const grad = ctx.createLinearGradient(0, 0, 480, 1123);
    grad.addColorStop(0, "rgba(6, 182, 212, 0.40)");
    grad.addColorStop(0.5, "rgba(14, 165, 233, 0.30)");
    grad.addColorStop(1, "rgba(2, 132, 199, 0.12)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 60;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(150, 80);
    ctx.lineTo(150, 1020);
    ctx.moveTo(390, 180);
    ctx.lineTo(390, 940);
    ctx.moveTo(150, 520);
    ctx.lineTo(390, 520);
    ctx.stroke();

    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

/**
 * Detects image brand signature using canvas pixel color sampling
 */
function detectImageBrandType(src: string): Promise<"mrsoft" | "product_hotelhub" | "product_gesrest" | "unknown"> {
  return new Promise((resolve) => {
    if (!src || !src.startsWith("data:image")) {
      resolve("unknown");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve("unknown");
          return;
        }
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let tealGreenCount = 0; // Mr Soft logo icon (#00b090 / #00a896 / #0d9488)
        let cyanBlueCount = 0;  // HotelHUB cyan (#00a3cc / #0ea5e9)
        let coralRedCount = 0;  // Gesrest red (#eb5454)

        const step = Math.max(1, Math.floor(data.length / 3000)) * 4;
        for (let i = 0; i < data.length; i += step) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 50) continue;

          // Teal / Green (Mr. Soft icon: R < 90, G > 120, G > R + 60, G >= B - 15)
          if (r < 90 && g > 120 && g > r + 60 && g >= b - 15) {
            tealGreenCount++;
          }
          // Cyan / Blue (HotelHUB: R < 90, G > 110, B > 160, B > G + 10)
          else if (r < 90 && g > 110 && b > 160 && b > g + 10) {
            cyanBlueCount++;
          }
          // Coral / Red (Gesrest: R > 180, G < 120, B < 120)
          else if (r > 180 && g < 120 && b < 120) {
            coralRedCount++;
          }
        }

        if (tealGreenCount > 8 && tealGreenCount > cyanBlueCount && tealGreenCount > coralRedCount) {
          resolve("mrsoft");
        } else if (cyanBlueCount > 8 && cyanBlueCount > coralRedCount) {
          resolve("product_hotelhub");
        } else if (coralRedCount > 8) {
          resolve("product_gesrest");
        } else {
          resolve("unknown");
        }
      } catch {
        resolve("unknown");
      }
    };
    img.onerror = () => resolve("unknown");
    img.src = src;
  });
}

/**
 * High-Fidelity Multi-Brand DOCX Parser.
 * - Dynamically extracts heading colors and cell shading from Word XML.
 * - Distinguishes brand colors (Gesrest coral #eb5454 vs HotelHUB cyan #00a3cc / #0ea5e9).
 * - Reads XML rels blip order to deterministically place product logos top-right and Mr Soft logo bottom-left.
 * - Preserves exact inline styles and table structures.
 */
export async function parseDocxFileToHtml(
  file: File,
  productName: string = "GESREST"
): Promise<{ pages: string[]; paperSize: "letter" | "a4" }> {
  const arrayBuffer = await file.arrayBuffer();

  const zipImages: string[] = [];
  const centeredTexts = new Set<string>();
  const rightTexts = new Set<string>();
  const bulletTexts = new Set<string>();
  const headingColorsMap = new Map<string, string>();
  const tableMetaList: CellMeta[][][] = [];
  let detectedPaperSize: "letter" | "a4" = "letter";

  // Product Brand Detection
  const lowerName = (productName + " " + file.name).toLowerCase();
  const isHotelhub = lowerName.includes("hotel") || lowerName.includes("hub");
  const primaryThemeColor = isHotelhub ? "#00a3cc" : "#eb5454";
  const brandEmail = isHotelhub ? "atencionalcliente@garzasoft.com" : "martin.ampuero@garzasoft.com";
  const brandWebsite = isHotelhub ? "https://hotelhub.com.pe" : "www.gesrest.net";
  const brandWebsiteLabel = isHotelhub ? "https://hotelhub.com.pe" : "www.gesrest.net";

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Read word/_rels/document.xml.rels to map rId -> target media path
    const relsXmlStr = await zip.files["word/_rels/document.xml.rels"]?.async("text");
    const rIdToPathMap = new Map<string, string>();
    if (relsXmlStr) {
      const relsDoc = new DOMParser().parseFromString(relsXmlStr, "application/xml");
      const rels = relsDoc.getElementsByTagName("Relationship");
      for (let i = 0; i < rels.length; i++) {
        const r = rels[i];
        const id = r.getAttribute("Id");
        const target = r.getAttribute("Target");
        if (id && target) {
          const cleanTarget = target.startsWith("word/") ? target : `word/${target}`;
          rIdToPathMap.set(id, cleanTarget);
        }
      }
    }

    // Extract exact paragraph properties, paper size and table cell structures from word/document.xml
    const docXmlStr = await zip.files["word/document.xml"]?.async("text");

    // 2. Scan word/document.xml for image embed order via regex across all XML formats (DrawingML, VML, blip, imagedata)
    const xmlOrderedPaths: string[] = [];
    if (docXmlStr) {
      const embedMatches = Array.from(docXmlStr.matchAll(/r:(?:embed|id)="([^"]+)"/g));
      for (const match of embedMatches) {
        const embedId = match[1];
        if (embedId && rIdToPathMap.has(embedId)) {
          const path = rIdToPathMap.get(embedId)!;
          if (zip.files[path] && !xmlOrderedPaths.includes(path)) {
            xmlOrderedPaths.push(path);
          }
        }
      }
    }

    const mediaFiles = Object.keys(zip.files)
      .filter((p) => p.startsWith("word/media/") && !zip.files[p].dir)
      .sort();

    const finalImagePaths = [
      ...xmlOrderedPaths,
      ...mediaFiles.filter((p) => !xmlOrderedPaths.includes(p)),
    ];

    for (const path of finalImagePaths) {
      const fileName = path.split("/").pop() || "";
      const base64 = await zip.files[path].async("base64");
      const ext = fileName.split(".").pop()?.toLowerCase() || "png";
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "svg"
          ? "image/svg+xml"
          : "image/" + ext;
      zipImages.push(`data:${mime};base64,${base64}`);
    }
    if (docXmlStr) {
      const xmlDoc = new DOMParser().parseFromString(docXmlStr, "application/xml");

      // Paper Size (w:pgSz) detection
      const pgSzElements = xmlDoc.getElementsByTagName("w:pgSz");
      if (pgSzElements.length > 0) {
        const pgSz = pgSzElements[0];
        const wVal = parseInt(pgSz.getAttribute("w:w") || "0", 10);
        const hVal = parseInt(pgSz.getAttribute("w:h") || "0", 10);
        if (wVal >= 12100 || (hVal > 0 && hVal <= 16000)) {
          detectedPaperSize = "letter";
        } else if (hVal > 16500) {
          detectedPaperSize = "a4";
        }
      }

      // Paragraph alignments, bullets and text colors
      const pElements = xmlDoc.getElementsByTagName("w:p");
      for (let i = 0; i < pElements.length; i++) {
        const p = pElements[i];
        const text = p.textContent?.trim();
        if (!text) continue;

        const jc = p.getElementsByTagName("w:jc")[0];
        if (jc) {
          const val = jc.getAttribute("w:val");
          if (val === "center") centeredTexts.add(text);
          else if (val === "right") rightTexts.add(text);
        }

        const numPr = p.getElementsByTagName("w:numPr")[0];
        if (numPr) {
          bulletTexts.add(text);
        }

        // Color detection inside paragraph run properties
        const colorEl = p.getElementsByTagName("w:color")[0];
        if (colorEl) {
          const val = colorEl.getAttribute("w:val");
          if (val && val !== "auto" && val.length === 6) {
            headingColorsMap.set(text, `#${val}`);
          }
        }
      }

      // Tables & Cell Shading (Background Colors)
      const tblElements = xmlDoc.getElementsByTagName("w:tbl");
      for (let t = 0; t < tblElements.length; t++) {
        const tbl = tblElements[t];
        const trElements = tbl.getElementsByTagName("w:tr");
        const tableRows: CellMeta[][] = [];

        for (let r = 0; r < trElements.length; r++) {
          const tr = trElements[r];
          const tcElements = tr.getElementsByTagName("w:tc");
          const rowCells: CellMeta[] = [];

          for (let c = 0; c < tcElements.length; c++) {
            const tc = tcElements[c];
            let bg = "transparent";
            let color = "#111827";
            let bold = false;
            let align = "center";

            // Cell Shading / Background
            const shd = tc.getElementsByTagName("w:shd")[0];
            if (shd) {
              const fill = shd.getAttribute("w:fill");
              if (fill && fill !== "auto" && fill !== "none" && fill.toLowerCase() !== "ffffff") {
                bg = `#${fill}`;
                color = "#ffffff";
                bold = true;
              }
            }

            // Cell alignment
            const jc = tc.getElementsByTagName("w:jc")[0];
            if (jc) {
              const val = jc.getAttribute("w:val");
              if (val === "left") align = "left";
              else if (val === "right") align = "right";
              else if (val === "center") align = "center";
            }

            // Check bold inside cell
            if (tc.getElementsByTagName("w:b").length > 0) {
              bold = true;
            }

            rowCells.push({ bg, color, bold, align });
          }
          tableRows.push(rowCells);
        }
        tableMetaList.push(tableRows);
      }
    }
  } catch (zipErr) {
    console.warn("Zip media/XML extraction error:", zipErr);
  }

  // 2. Mammoth options with list bullet styling
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(function (image: any) {
      return image.read("base64").then(function (imageBuffer: string) {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
          style:
            "max-width: 100%; height: auto; margin: 10px auto; display: block; border-radius: 4px;",
        };
      });
    }),
    styleMap: [
      "p[style-name='Title'] => h1.doc-title:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
      "p[style-name='Centered'] => p.text-center:fresh",
      "p[style-name='Center'] => p.text-center:fresh",
      "p[style-name='Centrado'] => p.text-center:fresh",
      "p[style-name='List Bullet'] => ul > li:fresh",
      "p[style-name='List Bullet 2'] => ul > li:fresh",
      "p[style-name='List'] => ul > li:fresh",
      "p[style-name='List Paragraph'] => ul > li:fresh",
      "table => table.a4-doc-table:fresh",
      "br[type='page'] => hr.page-break:fresh",
    ],
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
  let rawHtml = result.value;

  if (!rawHtml || rawHtml.trim() === "") {
    throw new Error("El archivo Word no contiene texto legible.");
  }

  // 3. Post-process HTML in DOM
  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  // Format all tables with high-fidelity Word XML cell shading & styling
  const tables = container.querySelectorAll("table");
  tables.forEach((tbl, tblIdx) => {
    const rows = Array.from(tbl.querySelectorAll("tr"));
    const maxCols = Math.max(...rows.map((r) => r.querySelectorAll("td, th").length), 1);
    const textLen = tbl.textContent?.length || 0;
    const isExtensive = maxCols >= 3 || textLen > 250 || rows.length > 5;

    const tableWidthStyle = isExtensive
      ? "width: 100%; margin: 16px auto;"
      : "width: auto; min-width: 340px; max-width: 540px; margin: 16px auto;";

    tbl.setAttribute(
      "style",
      `border-collapse: collapse; font-size: 11.5px; ${tableWidthStyle}`
    );

    const metaTable = tableMetaList[tblIdx];

    rows.forEach((row, rIdx) => {
      const cells = Array.from(row.querySelectorAll("td, th"));
      const numCells = cells.length || 1;

      cells.forEach((cell, cIdx) => {
        const cellMeta = metaTable?.[rIdx]?.[cIdx];
        const isColoredBg = cellMeta ? cellMeta.bg !== "transparent" : (rIdx === 0 && (maxCols > 2 || isExtensive));
        const bg = cellMeta?.bg || (isColoredBg ? primaryThemeColor : (isExtensive && rIdx % 2 === 1 ? "#fafafa" : "transparent"));
        const textColor = isColoredBg ? "#ffffff" : (cellMeta?.color || "#111827");
        const fontWeight = (cellMeta?.bold || isColoredBg) ? "600" : "normal";
        const textAlign = cellMeta?.align || (isColoredBg ? "center" : (isExtensive && cIdx > 0 ? "left" : "center"));

        let borderStyle = "border: none;";
        if (isExtensive) {
          borderStyle = "border: 1px solid #d1d5db;";
        } else if (isColoredBg) {
          borderStyle = "border: 1px solid #ffffff;";
        }

        const padding = isExtensive ? "padding: 8px 12px;" : "padding: 6px 20px;";
        const widthStyle = !isExtensive && numCells === 2 ? (cIdx === 0 ? "min-width: 140px;" : "min-width: 120px;") : "";

        cell.setAttribute(
          "style",
          `background-color: ${bg}; color: ${textColor}; font-weight: ${fontWeight}; text-align: ${textAlign}; font-size: 11.5px; ${padding} ${borderStyle} ${widthStyle}`
        );

        if (isColoredBg) {
          cell.querySelectorAll("p, span, strong, b, div").forEach((child) => {
            (child as HTMLElement).style.color = "#ffffff";
          });
        }
      });
    });
  });

  // Enhance links with brand primary theme color
  const links = container.querySelectorAll("a");
  links.forEach((a) => {
    a.setAttribute(
      "style",
      `color: ${primaryThemeColor}; font-weight: 500; text-decoration: underline; word-break: break-all;`
    );
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  // Enhance headings with detected or primary theme color
  container.querySelectorAll("h1").forEach((h) => {
    const text = h.textContent?.trim() || "";
    const color = headingColorsMap.get(text) || primaryThemeColor;
    h.setAttribute(
      "style",
      `color: ${color}; font-size: 18px; font-weight: 700; text-transform: uppercase; margin: 18px 0 10px 0; line-height: 1.3;`
    );
  });
  container.querySelectorAll("h2").forEach((h) => {
    const text = h.textContent?.trim() || "";
    const color = headingColorsMap.get(text) || primaryThemeColor;
    h.setAttribute(
      "style",
      `color: ${color}; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 10px 0;`
    );
  });
  container.querySelectorAll("h3").forEach((h) => {
    const text = h.textContent?.trim() || "";
    const color = headingColorsMap.get(text) || primaryThemeColor;
    h.setAttribute(
      "style",
      `color: ${color}; font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 14px 0 6px 0;`
    );
  });

  // Enhance paragraphs
  container.querySelectorAll("p").forEach((p) => {
    if (!p.closest("td, th")) {
      p.setAttribute("style", "margin: 0 0 8px 0; line-height: 1.6; font-size: 12.5px; color: #111827;");
    } else {
      p.setAttribute("style", "margin: 0; line-height: 1.4;");
    }
  });

  // Convert bullet items to real <ul> <li> lists if they weren't wrapped
  const paragraphs = Array.from(container.querySelectorAll("p"));
  paragraphs.forEach((p) => {
    const text = p.textContent?.trim() || "";
    if (bulletTexts.has(text) || text.startsWith("•") || text.startsWith("Detalle de los productos") || text.startsWith("El personal") || text.startsWith("El importe") || text.startsWith("El tiempo") || text.startsWith("La estadística") || text.startsWith("La productividad")) {
      const li = document.createElement("li");
      li.innerHTML = p.innerHTML.replace(/^[•\-*]\s*/, "");
      li.setAttribute("style", "margin: 4px 0; line-height: 1.6; font-size: 12.5px; list-style-type: disc;");

      const prevEl = p.previousElementSibling;
      if (prevEl && prevEl.tagName.toLowerCase() === "ul") {
        prevEl.appendChild(li);
        p.remove();
      } else {
        const ul = document.createElement("ul");
        ul.setAttribute("style", "margin: 8px 0 16px 24px; padding-left: 10px; list-style-type: disc;");
        ul.appendChild(li);
        p.parentNode?.insertBefore(ul, p);
        p.remove();
      }
    }
  });

  // Detect uppercase bold heading paragraphs and convert to styled headings
  container.querySelectorAll("p").forEach((p) => {
    const t = p.textContent?.trim() || "";
    const hasOnlyBold =
      p.children.length === 1 && (p.children[0].tagName === "STRONG" || p.children[0].tagName === "B");
    if (
      (hasOnlyBold && t.length < 90 && (t === t.toUpperCase() || t.startsWith("CREDENCIALES") || t.startsWith("CONFIGURACIÓN") || t.startsWith("PRESENTACIÓN") || t.startsWith("PERFIL") || t.startsWith("PORTAL"))) ||
      (t === "PRESENTACIÓN" || t === "CREDENCIALES PARA ACCESO A PORTAL DE CONTADOR" || t === "CONFIGURACIÓN DE SERIES" || t === "CREDENCIALES DE ACCESO")
    ) {
      const h2 = document.createElement("h2");
      h2.innerHTML = p.innerHTML;
      const matchedColor = headingColorsMap.get(t) || primaryThemeColor;
      h2.setAttribute(
        "style",
        `color: ${matchedColor}; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 18px 0 8px 0; letter-spacing: 0.3px;`
      );
      p.parentNode?.replaceChild(h2, p);
    }
  });

  // Apply alignments from Word XML
  container.querySelectorAll("p, h1, h2, h3, div, span, li").forEach((el) => {
    const text = el.textContent?.trim() || "";
    if (text && centeredTexts.has(text)) {
      el.setAttribute(
        "style",
        (el.getAttribute("style") || "") + " text-align: center; margin-left: auto; margin-right: auto;"
      );
    } else if (text && rightTexts.has(text)) {
      el.setAttribute(
        "style",
        (el.getAttribute("style") || "") + " text-align: right; margin-left: auto;"
      );
    }
  });

  // 4. Split content between Cover and Body at "PRESENTACIÓN"
  const fullHtml = container.innerHTML;
  let coverHtml = "";
  let fullBodyHtml = fullHtml;

  const presIndex = fullHtml.search(/PRESENTACI[OÓ]N/i);
  if (presIndex !== -1) {
    const beforeText = fullHtml.slice(0, presIndex);
    const tagOpen = beforeText.lastIndexOf("<h");
    const splitPoint = tagOpen !== -1 ? tagOpen : presIndex;
    coverHtml = fullHtml.slice(0, splitPoint);
    fullBodyHtml = fullHtml.slice(splitPoint);
  }

  // Remove leftover contact text from body
  fullBodyHtml = fullBodyHtml
    .replace(/<p[^>]*>\s*(?:\+51\s*979\s*293\s*176|martin\.ampuero@garzasoft\.com|atencionalcliente@garzasoft\.com|www\.gesrest\.net|https:\/\/hotelhub\.com\.pe)\s*<\/p>/gi, "")
    .replace(/<div>\s*(?:\+51\s*979\s*293\s*176|martin\.ampuero@garzasoft\.com|atencionalcliente@garzasoft\.com|www\.gesrest\.net|https:\/\/hotelhub\.com\.pe)\s*<\/div>/gi, "");

  // Extract cover images ONLY from Page 1 (coverHtml)
  const tempCoverDiv = document.createElement("div");
  tempCoverDiv.innerHTML = coverHtml;
  const coverImgs = Array.from(tempCoverDiv.querySelectorAll("img")).map((img) => img.src);
  let rawProductLogoSrc = "";
  let rawMrSoftLogoSrc = "";
  let watermarkImgSrc = "";

  if (coverImgs.length > 0) {
    const coverDims = await Promise.all(coverImgs.map(getImageDimensions));

    // 1. Identify Mr. Soft logo from Page 1 images
    for (const img of coverDims) {
      const brand = await detectImageBrandType(img.src);
      if (brand === "mrsoft" && !rawMrSoftLogoSrc) {
        rawMrSoftLogoSrc = img.src;
        break;
      }
    }

    const nonMrSoftImages = coverDims.filter((img) => img.src !== rawMrSoftLogoSrc);

    // 2. Product Logo (Top Right): Pick wide horizontal banner "HotelHUB Administra y reserva" (aspect > 1.2)
    let bestProductLogo = nonMrSoftImages.find(
      (img) => img.aspect > 1.2 || (img.width > 200 && img.width > img.height * 1.2)
    );

    if (!bestProductLogo && nonMrSoftImages.length > 1) {
      bestProductLogo = nonMrSoftImages[1];
    } else if (!bestProductLogo && nonMrSoftImages.length > 0) {
      bestProductLogo = nonMrSoftImages[0];
    }

    if (bestProductLogo) {
      rawProductLogoSrc = bestProductLogo.src;
    }

    // 3. Background Watermark (Center/Left): Pick square H icon (the non-MrSoft image that is NOT product logo)
    const watermarkCandidate = nonMrSoftImages.find((img) => img.src !== rawProductLogoSrc);
    if (watermarkCandidate) {
      watermarkImgSrc = watermarkCandidate.src;
    }

    // If Mr. Soft logo not assigned yet, pick second remaining image if available
    if (!rawMrSoftLogoSrc && coverDims.length > 1) {
      const secondImg = coverDims.find(
        (img) => img.src !== rawProductLogoSrc && img.src !== watermarkImgSrc
      );
      if (secondImg) rawMrSoftLogoSrc = secondImg.src;
    }
  } else if (zipImages.length > 0) {
    // Fallback ONLY if coverHtml has no <img> tags at all
    rawProductLogoSrc = zipImages[0];
    if (zipImages.length >= 2) rawMrSoftLogoSrc = zipImages[1];
  }

  // Auto-crop white borders and pre-render A4 cover background
  const [productLogoSrc, mrSoftLogoSrc, coverBgSrc] = await Promise.all([
    rawProductLogoSrc ? trimImageWhiteBorders(rawProductLogoSrc) : Promise.resolve(""),
    rawMrSoftLogoSrc ? trimImageWhiteBorders(rawMrSoftLogoSrc) : Promise.resolve(""),
    isHotelhub
      ? createHotelhubA4CoverBackground(watermarkImgSrc)
      : createGesrestA4CoverBackground(watermarkImgSrc || "/fondo_gesrest.png"),
  ]);

  // 5. Build Page 1 (Cover Page)
  const page1Html = `
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; margin: 0; padding: 0;">
  <img src="${coverBgSrc}" alt="Fondo" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block;" />
</div>

<div style="position: relative; z-index: 1; padding: 25px 30px; min-height: 980px;">
  <!-- Logo del Producto (Superior Derecho) y Contacto -->
  <div style="text-align: right; margin-top: 15px; margin-right: 0;">
    ${
      productLogoSrc
        ? `<img src="${productLogoSrc}" alt="${productName}" style="width: 270px; max-width: 100%; height: auto; margin-left: auto; margin-bottom: 6px; display: inline-block;" />`
        : `<h1 style="font-size: 38px; font-weight: bold; color: ${primaryThemeColor}; margin: 0;">${productName}</h1><div style="font-size: 14px; color: ${primaryThemeColor}; font-weight: 600;">${isHotelhub ? "Administra y reserva" : "Tu restaurante digital"}</div>`
    }
    <div style="font-size: 13px; font-weight: 500; color: #333; line-height: 1.8;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:${brandEmail}" style="color: ${primaryThemeColor}; text-decoration: underline;">${brandEmail}</a></div>
    </div>
  </div>

  <!-- Logo Mr. Soft (Inferior Izquierdo) -->
  <div style="position: absolute; bottom: 35px; left: 30px; z-index: 1;">
    ${
      mrSoftLogoSrc
        ? `<img src="${mrSoftLogoSrc}" alt="Mr. Soft Development" style="width: 220px; max-width: 100%; height: auto;" />`
        : `<div style="font-size: 28px; font-weight: bold; color: #1a1a1a;">Mr. Soft</div><div style="font-size: 12px; color: #0088cc; letter-spacing: 2px;">DEVELOPMENT</div>`
    }
  </div>

  <!-- Enlace Inferior Derecho -->
  <div style="position: absolute; bottom: 35px; right: 30px; z-index: 1;">
    <a href="${brandWebsite}" target="_blank" rel="noopener noreferrer" style="color: ${primaryThemeColor}; font-weight: 700; font-size: 15px; text-decoration: none;">
      ${brandWebsiteLabel}
    </a>
  </div>
</div>
`;

  // 6. Header logo template for every subsequent page (Pages 2 to N)
  const headerLogoHtml = `
<table style="width: 100%; border: none; border-collapse: collapse; margin-bottom: 12px;">
  <tr>
    <td style="border: none; text-align: right; padding: 0;">
      ${
        productLogoSrc
          ? `<img src="${productLogoSrc}" alt="${productName}" style="width: 130px; max-width: 100%; height: auto; display: inline-block;" />`
          : `<span style="font-size: 18px; font-weight: 700; color: ${primaryThemeColor};">${productName}</span>`
      }
    </td>
  </tr>
</table>
`;

  // 7. Split by explicit page breaks and paginate into A4 sheets
  let rawSections: string[] = [fullBodyHtml];

  if (fullBodyHtml.includes('<hr class="page-break"') || fullBodyHtml.includes("<hr")) {
    const explicitPages = fullBodyHtml
      .split(/(?:<p[^>]*>\s*)?<hr[^>]*>(?:\s*<\/p>)?/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (explicitPages.length > 0) {
      rawSections = explicitPages;
    }
  }

  const finalBodyPages: string[] = [];
  const heightThreshold = detectedPaperSize === "a4" ? 920 : 850;
  for (const sec of rawSections) {
    const cleanSec = cleanHtmlPageContent(sec);
    if (!cleanSec || isPageEmpty(cleanSec)) continue;
    const subPages = paginateHtmlByA4Height(cleanSec, heightThreshold, detectedPaperSize);
    for (const subPage of subPages) {
      const cleanSub = cleanHtmlPageContent(subPage);
      if (cleanSub && !isPageEmpty(cleanSub)) {
        finalBodyPages.push(headerLogoHtml + cleanSub);
      }
    }
  }

  const allPages = [page1Html, ...finalBodyPages].filter(
    (p, idx) => idx === 0 || !isPageEmpty(p)
  );

  return { pages: allPages, paperSize: detectedPaperSize };
}
