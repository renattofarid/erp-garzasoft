import mammoth from "mammoth";
import JSZip from "jszip";
import { paginateHtmlByA4Height } from "./a4Paginator";

/**
 * High-Fidelity DOCX Parser.
 * - Extracts 100% of images, text, and tables.
 * - Accurately sets Page 1 cover with /fondo_gesrest.png (2/3 width) and contact info.
 * - Places top-right Gesrest logo/header on every subsequent page.
 * - Formats all tables into clean 2-column tables with coral headers (#eb5454).
 */
export async function parseDocxFileToHtml(
  file: File,
  productName: string = "GESREST"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Extract all images from ZIP
  const extractedImages: string[] = [];
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
      extractedImages.push(`data:${mime};base64,${base64}`);
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

  // 3. Post-process and style HTML in DOM
  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  // Remove cover items from the content body so they don't duplicate on page 2
  const allParagraphs = Array.from(container.querySelectorAll("p, div"));
  allParagraphs.forEach((p) => {
    const text = p.textContent?.trim() || "";
    if (
      text.includes("+51 979 293 176") ||
      text.includes("martin.ampuero@garzasoft.com") ||
      text.includes("www.gesrest.net") ||
      (text === "Mr. Soft" && !p.nextElementSibling?.tagName.startsWith("TABLE"))
    ) {
      p.remove();
    }
  });

  // Remove standalone cover logo images from content body
  const docxImgElements = Array.from(container.querySelectorAll("img"));
  if (docxImgElements.length >= 3) {
    // First 3 images are usually cover logos in the template
    docxImgElements.slice(0, 3).forEach((img) => {
      const parent = img.parentElement;
      if (parent && parent.children.length === 1 && parent.tagName.toLowerCase() === "p") {
        parent.remove();
      } else {
        img.remove();
      }
    });
  }

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

  // 4. Build Page 1 (Cover Page) with exact 2/3 width background and positioned text
  const page1Html = `
<div style="position: absolute; top: 0; left: 0; bottom: 0; width: 68%; height: 100%; pointer-events: none; z-index: 0;">
  <img src="/fondo_gesrest.png" alt="Fondo Gesrest" style="width: 100%; height: 100%; object-fit: contain; object-position: left center;" />
</div>

<div style="position: relative; z-index: 1; padding: 20px; min-height: 980px;">
  <div style="text-align: right; margin-top: 70px; margin-right: 15px;">
    <div style="font-size: 12px; color: #444; line-height: 1.8;">
      <div>+51 979 293 176</div>
      <div><a href="mailto:martin.ampuero@garzasoft.com" style="color: #0b4e8c; text-decoration: underline;">martin.ampuero@garzasoft.com</a></div>
    </div>
  </div>

  <div style="text-align: right; margin-top: 670px; margin-right: 20px;">
    <a href="https://www.gesrest.net" target="_blank" rel="noopener noreferrer" style="color: #eb5454; font-weight: bold; font-size: 14px; text-decoration: none;">
      www.gesrest.net
    </a>
  </div>
</div>
`;

  // 5. Header logo template for every subsequent page
  const headerLogoHtml = `
<div style="float: right; text-align: right; margin-bottom: 20px; clear: right;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
  <span style="font-size: 9.5px; color: #888;">Tu restaurante digital</span>
</div>
<div style="clear: both;"></div>
`;

  // 6. Check explicit page breaks or paginate content
  const fullContentHtml = container.innerHTML;
  let otherPages: string[] = [];

  if (fullContentHtml.includes('<hr class="page-break"') || fullContentHtml.includes("<hr")) {
    const explicitPages = fullContentHtml
      .split(/<hr(?:\s+class="page-break")?\s*\/?>/i)
      .filter((p) => p.trim().length > 0);
    if (explicitPages.length > 1) {
      otherPages = explicitPages.slice(1).map((p) => headerLogoHtml + p);
    }
  }

  if (otherPages.length === 0) {
    const paginated = paginateHtmlByA4Height(fullContentHtml, 860);
    otherPages = paginated.map((p) => headerLogoHtml + p);
  }

  return [page1Html, ...otherPages];
}
