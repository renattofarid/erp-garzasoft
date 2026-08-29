import JSZip from "jszip";

/**
 * Direct Word (.docx) XML and media parser.
 * Reads word/document.xml and word/media/ directly from the ZIP archive.
 * Preserves exact page breaks, 2-column tables, links, bold/italic, alignment and images.
 */
export async function parseDocxFileToHtml(
  file: File,
  _productName: string = "PRODUCTO"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Extract all media files into base64 map
  const imageMap: Record<string, string> = {};
  const mediaFiles = Object.keys(zip.files).filter(
    (p) => p.startsWith("word/media/") && !zip.files[p].dir
  );

  for (const path of mediaFiles) {
    const fileName = path.split("/").pop() || "";
    const base64 = await zip.files[path].async("base64");
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : "image/" + ext;
    imageMap[fileName] = `data:${mime};base64,${base64}`;
  }

  // 2. Read relationship mappings (rId -> image / hyperlink)
  const relsMap: Record<string, { target: string; type: string }> = {};
  if (zip.files["word/_rels/document.xml.rels"]) {
    const relsXmlText = await zip.files["word/_rels/document.xml.rels"].async("text");
    const parser = new DOMParser();
    const relsDoc = parser.parseFromString(relsXmlText, "application/xml");
    const relElements = relsDoc.querySelectorAll("Relationship");
    relElements.forEach((rel) => {
      const id = rel.getAttribute("Id") || "";
      const target = rel.getAttribute("Target") || "";
      const type = rel.getAttribute("Type") || "";
      relsMap[id] = { target, type };
    });
  }

  // 3. Read main document XML
  if (!zip.files["word/document.xml"]) {
    throw new Error("El archivo .docx no contiene word/document.xml");
  }

  const docXmlText = await zip.files["word/document.xml"].async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlText, "application/xml");

  const body = xmlDoc.querySelector("w\\:body, body");
  if (!body) {
    throw new Error("No se pudo leer el cuerpo del documento Word.");
  }

  const pages: string[] = [];
  let currentPageHtml = "";

  // Helper to parse runs (<w:r>) inside a paragraph or cell
  const parseRun = (runNode: Element): string => {
    let runText = "";

    // Check for text
    const textNodes = runNode.querySelectorAll("w\\:t, t");
    textNodes.forEach((t) => {
      runText += t.textContent || "";
    });

    if (!runText && !runNode.querySelector("w\\:drawing, drawing, w\\:pict, pict")) {
      return "";
    }

    // Check formatting
    const rPr = runNode.querySelector("w\\:rPr, rPr");
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let color = "";
    let fontSize = "";

    if (rPr) {
      if (rPr.querySelector("w\\:b, b")) isBold = true;
      if (rPr.querySelector("w\\:i, i")) isItalic = true;
      if (rPr.querySelector("w\\:u, u")) isUnderline = true;

      const colorEl = rPr.querySelector("w\\:color, color");
      if (colorEl) {
        const val = colorEl.getAttribute("w:val") || colorEl.getAttribute("val");
        if (val && val !== "auto") color = "#" + val;
      }

      const szEl = rPr.querySelector("w\\:sz, sz");
      if (szEl) {
        const val = szEl.getAttribute("w:val") || szEl.getAttribute("val");
        if (val) {
          const pt = parseInt(val, 10) / 2;
          if (!isNaN(pt) && pt > 0) fontSize = `${pt}pt`;
        }
      }
    }

    // Check for images inside run
    let imgHtml = "";
    const blipEls = runNode.querySelectorAll("a\\:blip, blip");
    blipEls.forEach((blip) => {
      const embedId =
        blip.getAttribute("r:embed") ||
        blip.getAttribute("embed") ||
        blip.getAttribute("r:link");
      if (embedId && relsMap[embedId]) {
        const target = relsMap[embedId].target;
        const fileName = target.split("/").pop() || "";
        const dataUrl = imageMap[fileName] || target;
        imgHtml += `<img src="${dataUrl}" alt="${fileName}" style="max-width: 100%; height: auto; margin: 10px auto; display: block; border-radius: 4px;" />`;
      }
    });

    let formatted = runText ? escapeHtml(runText) : "";
    if (isBold) formatted = `<strong>${formatted}</strong>`;
    if (isItalic) formatted = `<em>${formatted}</em>`;
    if (isUnderline) formatted = `<u>${formatted}</u>`;

    let style = "";
    if (color) style += `color: ${color}; `;
    if (fontSize) style += `font-size: ${fontSize}; `;

    if (style) {
      formatted = `<span style="${style}">${formatted}</span>`;
    }

    return formatted + imgHtml;
  };

  // Helper to parse paragraph (<w:p>)
  const parseParagraph = (pNode: Element): { html: string; isPageBreak: boolean } => {
    let pContent = "";
    let isPageBreak = false;

    // Check if this paragraph contains a page break
    const brPage = pNode.querySelector('w\\:br[w\\:type="page"], br[type="page"]');
    if (brPage) {
      isPageBreak = true;
    }

    // Alignment
    let textAlign = "";
    const jc = pNode.querySelector("w\\:jc, jc");
    if (jc) {
      const val = jc.getAttribute("w:val") || jc.getAttribute("val");
      if (val === "center") textAlign = "center";
      else if (val === "right") textAlign = "right";
      else if (val === "both" || val === "justify") textAlign = "justify";
    }

    // Iterate children of paragraph (runs, hyperlinks)
    Array.from(pNode.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag.endsWith("hyperlink")) {
        const rId =
          child.getAttribute("r:id") || child.getAttribute("id");
        let href = "#";
        if (rId && relsMap[rId]) {
          href = relsMap[rId].target;
        }

        let linkInner = "";
        child.querySelectorAll("w\\:r, r").forEach((r) => {
          linkInner += parseRun(r);
        });

        if (!linkInner) linkInner = href;
        pContent += `<a href="${href}" style="color: #eb5454; text-decoration: underline; word-break: break-all;">${linkInner}</a>`;
      } else if (tag.endsWith(":r") || tag === "r") {
        pContent += parseRun(child);
      }
    });

    // Headings or normal paragraph
    let style = "margin: 0 0 8px 0; line-height: 1.55;";
    if (textAlign) style += ` text-align: ${textAlign};`;

    if (!pContent.trim()) {
      return { html: `<p style="${style}">&nbsp;</p>`, isPageBreak };
    }

    return { html: `<p style="${style}">${pContent}</p>`, isPageBreak };
  };

  // Helper to parse table (<w:tbl>)
  const parseTable = (tblNode: Element): string => {
    const rows = tblNode.querySelectorAll("w\\:tr, tr");
    if (rows.length === 0) return "";

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 14px 0; border: 1px solid #d1d5db; font-size: 11.5px;"><tbody>`;

    rows.forEach((tr, rowIdx) => {
      const isHeader = rowIdx === 0;
      tableHtml += `<tr style="${isHeader ? "background-color: #eb5454; color: #ffffff;" : "background-color: #ffffff;"}">`;

      const cells = tr.querySelectorAll("w\\:tc, tc");
      cells.forEach((tc) => {
        let cellContent = "";
        const pNodes = tc.querySelectorAll("w\\:p, p");
        pNodes.forEach((p) => {
          const parsed = parseParagraph(p);
          cellContent += parsed.html;
        });

        // Cell background color
        const shd = tc.querySelector("w\\:shd, shd");
        let bgStyle = "";
        if (shd) {
          const fill = shd.getAttribute("w:fill") || shd.getAttribute("fill");
          if (fill && fill !== "auto" && fill !== "none" && !isHeader) {
            bgStyle = `background-color: #${fill};`;
          }
        }

        const tag = isHeader ? "th" : "td";
        tableHtml += `<${tag} style="border: 1px solid #d1d5db; padding: 7px 10px; vertical-align: middle; ${bgStyle}">${cellContent || "&nbsp;"}</${tag}>`;
      });

      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;
    return tableHtml;
  };

  // 4. Iterate over top-level body elements
  const bodyChildren = Array.from(body.children);

  bodyChildren.forEach((node) => {
    const tag = node.tagName.toLowerCase();

    if (tag.endsWith(":p") || tag === "p") {
      const { html, isPageBreak } = parseParagraph(node);

      if (isPageBreak) {
        if (currentPageHtml.trim()) {
          pages.push(currentPageHtml);
          currentPageHtml = "";
        }
      }

      currentPageHtml += html + "\n";
    } else if (tag.endsWith(":tbl") || tag === "tbl") {
      const tblHtml = parseTable(node);
      currentPageHtml += tblHtml + "\n";
    } else if (tag.endsWith(":sectpr") || tag === "sectpr") {
      // Section break in Word creates a new page
      if (currentPageHtml.trim()) {
        pages.push(currentPageHtml);
        currentPageHtml = "";
      }
    }
  });

  if (currentPageHtml.trim()) {
    pages.push(currentPageHtml);
  }

  // If only 1 page was found, return it as array with 1 page
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
