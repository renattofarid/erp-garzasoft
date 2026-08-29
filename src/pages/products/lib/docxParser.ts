import mammoth from "mammoth";
import JSZip from "jszip";
import { paginateHtmlByA4Height } from "./a4Paginator";

/**
 * Gets image natural dimensions asynchronously
 */
function getImageDimensions(src: string): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ src, width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
    img.onerror = () => resolve({ src, width: 100, height: 100 });
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

        // Find top non-white boundary
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

        // Find bottom non-white boundary
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

        // Find left non-white boundary
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

        // Find right non-white boundary
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
 * High-Fidelity DOCX Parser for Gesrest Documents.
 * - Extracts colors and bullet styles from Word XML.
 * - Auto-crops logos to tight rectangular bounding boxes.
 * - Preserves coral heading colors (#eb5454) and bullet lists.
 * - Keeps header clean on Pages 2 to 8 (logo only, without contact text).
 */
export async function parseDocxFileToHtml(
  file: File,
  productName: string = "GESREST"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Extract all images, paragraph alignments, colors, and bullet paragraphs from Word ZIP
  const zipImages: string[] = [];
  const centeredTexts = new Set<string>();
  const rightTexts = new Set<string>();
  const bulletTexts = new Set<string>();
  const colorMap = new Map<string, string>();

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaFiles = Object.keys(zip.files)
      .filter((p) => p.startsWith("word/media/") && !zip.files[p].dir)
      .sort();

    for (const path of mediaFiles) {
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

    // Extract exact paragraph properties from word/document.xml
    const docXmlStr = await zip.files["word/document.xml"]?.async("text");
    if (docXmlStr) {
      const xmlDoc = new DOMParser().parseFromString(docXmlStr, "application/xml");
      const pElements = xmlDoc.getElementsByTagName("w:p");
      for (let i = 0; i < pElements.length; i++) {
        const p = pElements[i];
        const text = p.textContent?.trim();
        if (!text) continue;

        // Alignment
        const jc = p.getElementsByTagName("w:jc")[0];
        if (jc) {
          const val = jc.getAttribute("w:val");
          if (val === "center") centeredTexts.add(text);
          else if (val === "right") rightTexts.add(text);
        }

        // Bullet / Numbering
        const numPr = p.getElementsByTagName("w:numPr")[0];
        if (numPr) {
          bulletTexts.add(text);
        }

        // Colors
        const colors = p.getElementsByTagName("w:color");
        if (colors.length > 0) {
          const hex = colors[0].getAttribute("w:val");
          if (hex && hex !== "auto") {
            colorMap.set(text, `#${hex}`);
          }
        }
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

  // Format all tables with the exact "Insert Table" style
  const tables = container.querySelectorAll("table");
  tables.forEach((tbl) => {
    tbl.setAttribute(
      "style",
      "width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11.5px; border: 1px solid #d1d5db;"
    );

    const rows = Array.from(tbl.querySelectorAll("tr"));
    rows.forEach((row, rIdx) => {
      const isHeader = rIdx === 0;

      if (isHeader) {
        row.setAttribute(
          "style",
          "background-color: #eb5454; color: #ffffff; font-weight: bold;"
        );
      } else {
        const bg = rIdx % 2 === 1 ? "background-color: #fafafa;" : "background-color: #ffffff;";
        row.setAttribute("style", bg);
      }

      const cells = Array.from(row.querySelectorAll("td, th"));
      const numCells = cells.length || 1;

      cells.forEach((cell, cIdx) => {
        let widthStyle = "";
        if (numCells === 2) {
          widthStyle = cIdx === 0 ? "width: 45%;" : "width: 55%;";
        }

        const textColor = isHeader
          ? "color: #ffffff; font-weight: bold; text-align: center;"
          : "color: #111827;";
        cell.setAttribute(
          "style",
          `border: 1px solid #d1d5db; padding: 8px 12px; vertical-align: middle; font-size: 11.5px; ${textColor} ${widthStyle}`
        );
      });
    });
  });

  // Enhance links: coral red with underline
  const links = container.querySelectorAll("a");
  links.forEach((a) => {
    a.setAttribute(
      "style",
      "color: #eb5454; font-weight: 500; text-decoration: underline; word-break: break-all;"
    );
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  // Enhance headings with distinctive Coral color (#eb5454)
  container.querySelectorAll("h1").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 18px; font-weight: 700; text-transform: uppercase; margin: 18px 0 10px 0; line-height: 1.3;"
    );
  });
  container.querySelectorAll("h2").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 10px 0;"
    );
  });
  container.querySelectorAll("h3").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 14px 0 6px 0;"
    );
  });

  // Enhance paragraphs
  container.querySelectorAll("p").forEach((p) => {
    p.setAttribute("style", "margin: 0 0 8px 0; line-height: 1.6; font-size: 12.5px; color: #111827;");
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
      (t === "PRESENTACIÓN" || t === "CREDENCIALES PARA ACCESO A PORTAL DE CONTADOR" || t === "CONFIGURACIÓN DE SERIES")
    ) {
      const h2 = document.createElement("h2");
      h2.innerHTML = p.innerHTML;
      h2.setAttribute(
        "style",
        "color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 18px 0 8px 0; letter-spacing: 0.3px;"
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

  // Remove any leftover cover contact text from the body if it leaked
  fullBodyHtml = fullBodyHtml
    .replace(/<p[^>]*>\s*(?:\+51\s*979\s*293\s*176|martin\.ampuero@garzasoft\.com|www\.gesrest\.net)\s*<\/p>/gi, "")
    .replace(/<div>\s*(?:\+51\s*979\s*293\s*176|martin\.ampuero@garzasoft\.com|www\.gesrest\.net)\s*<\/div>/gi, "");

  // Extract cover image sources from coverHtml or zipImages
  const tempCoverDiv = document.createElement("div");
  tempCoverDiv.innerHTML = coverHtml;
  const coverImgs = Array.from(tempCoverDiv.querySelectorAll("img")).map((img) => img.src);
  const candidateImages = coverImgs.length > 0 ? coverImgs : zipImages;

  // Inspect image dimensions to accurately determine roles
  const imageDims = await Promise.all(candidateImages.map(getImageDimensions));
  imageDims.sort((a, b) => b.width * b.height - a.width * a.height);

  let watermarkImgSrc = "/fondo_gesrest.png";
  if (imageDims.length > 0 && (imageDims[0].width >= 250 || imageDims[0].height >= 250)) {
    watermarkImgSrc = imageDims[0].src;
  }

  const logoCandidates = candidateImages.filter((src) => src !== watermarkImgSrc);
  let rawMrSoftLogoSrc = "";
  let rawGesrestLogoSrc = "";

  if (logoCandidates.length >= 2) {
    rawMrSoftLogoSrc = logoCandidates[0];
    rawGesrestLogoSrc = logoCandidates[1];
  } else if (logoCandidates.length === 1) {
    rawGesrestLogoSrc = logoCandidates[0];
    rawMrSoftLogoSrc = "";
  } else if (zipImages.length >= 2) {
    rawMrSoftLogoSrc = zipImages[0];
    rawGesrestLogoSrc = zipImages[1];
  }

  // Auto-crop white borders so bounding boxes are tightly rectangular
  const [gesrestLogoSrc, mrSoftLogoSrc] = await Promise.all([
    rawGesrestLogoSrc ? trimImageWhiteBorders(rawGesrestLogoSrc) : Promise.resolve(""),
    rawMrSoftLogoSrc ? trimImageWhiteBorders(rawMrSoftLogoSrc) : Promise.resolve(""),
  ]);

  // 5. Build Page 1 (Cover Page) with symmetric G watermark positioned to top-left
  const page1Html = `
<div style="position: absolute; top: -50px; left: -60px; width: 800px; height: 1080px; pointer-events: auto; z-index: 0; overflow: hidden; margin: 0; padding: 0;">
  <img src="${watermarkImgSrc}" alt="Fondo Gesrest" style="position: absolute; top: -320px; left: -700px; width: 1800px; height: 1800px; max-width: none; max-height: none; display: block;" />
</div>

<div style="position: relative; z-index: 1; padding: 10px; min-height: 960px;">
  <!-- Logo de Gesrest (Superior Derecho - Rectangular Ajustado) y Contacto -->
  <div style="text-align: right; margin-top: 25px; margin-right: 5px;">
    ${
      gesrestLogoSrc
        ? `<img src="${gesrestLogoSrc}" alt="Gesrest" style="width: 280px; max-width: 100%; height: auto; margin-left: auto; margin-bottom: 6px; display: inline-block;" />`
        : `<h1 style="font-size: 38px; font-weight: bold; color: #eb5454; margin: 0;">${productName}</h1><div style="font-size: 15px; color: #eb5454; font-weight: 600;">Tu restaurante digital</div>`
    }
    <div style="font-size: 13px; font-weight: 500; color: #333; line-height: 1.8;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
    </div>
  </div>

  <!-- Logo Mr. Soft (Inferior Izquierdo - Rectangular Ajustado) -->
  <div style="position: absolute; bottom: 35px; left: 35px; z-index: 1;">
    ${
      mrSoftLogoSrc
        ? `<img src="${mrSoftLogoSrc}" alt="Mr. Soft Development" style="width: 220px; max-width: 100%; height: auto;" />`
        : `<div style="font-size: 28px; font-weight: bold; color: #1a1a1a;">Mr. Soft</div><div style="font-size: 12px; color: #0088cc; letter-spacing: 2px;">DEVELOPMENT</div>`
    }
  </div>

  <!-- Enlace Inferior Derecho -->
  <div style="position: absolute; bottom: 35px; right: 35px; z-index: 1;">
    <a href="https://www.gesrest.net" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: 700; font-size: 16px; text-decoration: none;">
      www.gesrest.net
    </a>
  </div>
</div>
`;

  // 6. Header logo template for every subsequent page (Pages 2 to N) - ONLY Logo, no contact text!
  const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 24px; clear: right;">
  ${
    gesrestLogoSrc
      ? `<img src="${gesrestLogoSrc}" alt="Gesrest" style="width: 140px; max-width: 100%; height: auto; display: inline-block;" />`
      : `<span style="font-size: 20px; font-weight: 700; color: #eb5454;">${productName}</span><br><span style="font-size: 10px; color: #888;">Tu restaurante digital</span>`
  }
</div>
<div style="clear: both;"></div>
`;

  // 7. Check explicit page breaks or paginate body content into A4 sheets
  let otherPages: string[] = [];

  if (fullBodyHtml.includes('<hr class="page-break"') || fullBodyHtml.includes("<hr")) {
    const explicitPages = fullBodyHtml
      .split(/<hr(?:\s+class="page-break")?\s*\/?>/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (explicitPages.length > 0) {
      otherPages = explicitPages.map((p) => headerLogoHtml + p);
    }
  }

  if (otherPages.length === 0) {
    const paginated = paginateHtmlByA4Height(fullBodyHtml, 860);
    otherPages = paginated.map((p) => headerLogoHtml + p);
  }

  return [page1Html, ...otherPages];
}
