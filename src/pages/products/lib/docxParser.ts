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
 * - Detects centered, right-aligned, and justified text directly from document.xml.
 * - Auto-crops logos to tight rectangular bounding boxes.
 * - Background: G watermark scaled to 1800x1800 symmetric, top: -320px, left: -700px.
 * - Top Right: Gesrest Logo (rectangular, width: 280px) + Phone & Email.
 * - Bottom Left: Mr. Soft Logo (rectangular, width: 220px).
 * - Bottom Right: www.gesrest.net.
 */
export async function parseDocxFileToHtml(
  file: File,
  productName: string = "GESREST"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Extract all images and paragraph alignments directly from Word ZIP
  const zipImages: string[] = [];
  const centeredTexts = new Set<string>();
  const rightTexts = new Set<string>();

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

    // Extract exact paragraph alignments from word/document.xml
    const docXmlStr = await zip.files["word/document.xml"]?.async("text");
    if (docXmlStr) {
      const xmlDoc = new DOMParser().parseFromString(docXmlStr, "application/xml");
      const pElements = xmlDoc.getElementsByTagName("w:p");
      for (let i = 0; i < pElements.length; i++) {
        const p = pElements[i];
        const jc = p.getElementsByTagName("w:jc")[0];
        if (jc) {
          const val = jc.getAttribute("w:val");
          const text = p.textContent?.trim();
          if (text) {
            if (val === "center") {
              centeredTexts.add(text);
            } else if (val === "right") {
              rightTexts.add(text);
            }
          }
        }
      }
    }
  } catch (zipErr) {
    console.warn("Zip media/XML extraction error:", zipErr);
  }

  // 2. Mammoth options
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

  // Enhance headings
  container.querySelectorAll("h1").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 20px; font-weight: 700; margin: 16px 0 8px 0; line-height: 1.25;"
    );
  });
  container.querySelectorAll("h2").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 15px; font-weight: 700; text-transform: uppercase; margin: 14px 0 6px 0;"
    );
  });
  container.querySelectorAll("h3").forEach((h) => {
    h.setAttribute(
      "style",
      "color: #eb5454; font-size: 13px; font-weight: 700; text-transform: uppercase; margin: 12px 0 4px 0;"
    );
  });

  // Enhance paragraphs
  container.querySelectorAll("p").forEach((p) => {
    p.setAttribute("style", "margin: 0 0 6px 0; line-height: 1.55; font-size: 12.5px;");
  });

  // Apply centered and right alignments detected from Word XML
  container.querySelectorAll("p, h1, h2, h3, div").forEach((el) => {
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

  // Extract cover image sources from coverHtml or zipImages
  const tempCoverDiv = document.createElement("div");
  tempCoverDiv.innerHTML = coverHtml;
  const coverImgs = Array.from(tempCoverDiv.querySelectorAll("img")).map((img) => img.src);
  const candidateImages = coverImgs.length > 0 ? coverImgs : zipImages;

  // Inspect image dimensions to accurately determine roles
  const imageDims = await Promise.all(candidateImages.map(getImageDimensions));
  // Sort by area descending
  imageDims.sort((a, b) => b.width * b.height - a.width * a.height);

  let watermarkImgSrc = "/fondo_gesrest.png";
  if (imageDims.length > 0 && (imageDims[0].width >= 250 || imageDims[0].height >= 250)) {
    watermarkImgSrc = imageDims[0].src;
  }

  // The remaining 2 images are:
  // candidateImages[0] = Mr. Soft Logo
  // candidateImages[1] = Gesrest Logo
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

  // 6. Header logo template for every subsequent page (Pages 2 to N) using Gesrest Logo
  const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 20px; clear: right;">
  ${
    gesrestLogoSrc
      ? `<img src="${gesrestLogoSrc}" alt="Gesrest" style="width: 150px; max-width: 100%; height: auto; display: inline-block;" />`
      : `<span style="font-size: 22px; font-weight: 700; color: #eb5454;">${productName}</span><br><span style="font-size: 11px; color: #888;">Tu restaurante digital</span>`
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
