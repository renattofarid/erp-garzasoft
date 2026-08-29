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
 * High-Fidelity DOCX Parser for Gesrest Documents.
 * - Accurately places:
 *   - Top Right: Gesrest Logo (Large, height: 80px) + Phone & Email
 *   - Bottom Left: Mr. Soft Logo (Large, height: 60px)
 *   - Background: G Watermark (Left 70% width)
 *   - Headers Pages 2 to 8: Gesrest Logo (height: 48px)
 */
export async function parseDocxFileToHtml(
  file: File,
  productName: string = "GESREST"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Extract all images from ZIP in order
  const zipImages: string[] = [];
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
  } catch (zipErr) {
    console.warn("Zip media extraction error:", zipErr);
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
  // We explicitly assign Gesrest to Top Right and Mr. Soft to Bottom Left
  const logoCandidates = candidateImages.filter((src) => src !== watermarkImgSrc);
  let mrSoftLogoSrc = "";
  let gesrestLogoSrc = "";

  if (logoCandidates.length >= 2) {
    // In Word: image 1 is Mr. Soft, image 2 is Gesrest
    mrSoftLogoSrc = logoCandidates[0];
    gesrestLogoSrc = logoCandidates[1];
  } else if (logoCandidates.length === 1) {
    gesrestLogoSrc = logoCandidates[0];
    mrSoftLogoSrc = "";
  } else if (zipImages.length >= 2) {
    mrSoftLogoSrc = zipImages[0];
    gesrestLogoSrc = zipImages[1];
  }

  // 5. Build Page 1 (Cover Page) with prominent enlarged logos
  const page1Html = `
<div style="position: absolute; top: 0; left: 0; bottom: 0; width: 70%; height: 100%; pointer-events: auto; z-index: 0;">
  <img src="${watermarkImgSrc}" alt="Fondo Gesrest" style="width: 100%; height: 100%; object-fit: contain; object-position: left center;" />
</div>

<div style="position: relative; z-index: 1; padding: 20px; min-height: 980px;">
  <!-- Logo de Gesrest (Superior Derecho - GRANDE) y Contacto -->
  <div style="text-align: right; margin-top: 40px; margin-right: 15px;">
    ${
      gesrestLogoSrc
        ? `<img src="${gesrestLogoSrc}" alt="Gesrest" style="max-height: 120px; max-width: 360px; width: auto; height: auto; margin-left: auto; margin-bottom: 12px; display: inline-block;" />`
        : `<h1 style="font-size: 36px; font-weight: bold; color: #eb5454; margin: 0;">${productName}</h1><div style="font-size: 14px; color: #eb5454; font-weight: 600;">Tu restaurante digital</div>`
    }
    <div style="font-size: 13px; color: #444; line-height: 1.8; margin-top: 8px;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
    </div>
  </div>

  <!-- Logo Mr. Soft (Inferior Izquierdo - GRANDE) -->
  <div style="position: absolute; bottom: 45px; left: 35px; z-index: 1;">
    ${
      mrSoftLogoSrc
        ? `<img src="${mrSoftLogoSrc}" alt="Mr. Soft Development" style="max-height: 95px; max-width: 320px; width: auto; height: auto;" />`
        : `<div style="font-size: 26px; font-weight: bold; color: #1a1a1a;">Mr. Soft</div><div style="font-size: 12px; color: #0088cc; letter-spacing: 1.5px;">DEVELOPMENT</div>`
    }
  </div>

  <!-- Enlace Inferior Derecho -->
  <div style="position: absolute; bottom: 45px; right: 30px; z-index: 1;">
    <a href="https://www.gesrest.net" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: bold; font-size: 15px; text-decoration: none;">
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
      ? `<img src="${gesrestLogoSrc}" alt="Gesrest" style="max-height: 55px; max-width: 240px; width: auto; height: auto; display: inline-block;" />`
      : `<span style="font-size: 20px; font-weight: 700; color: #eb5454;">${productName}</span><br><span style="font-size: 11px; color: #888;">Tu restaurante digital</span>`
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
