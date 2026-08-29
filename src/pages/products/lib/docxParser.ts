import * as docx from "docx-preview";
import JSZip from "jszip";

export async function parseDocxFileToHtml(
  file: File,
  _productName: string = "PRODUCTO"
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  const tempWrapper = document.createElement("div");
  tempWrapper.style.position = "fixed";
  tempWrapper.style.left = "-9999px";
  tempWrapper.style.top = "-9999px";
  tempWrapper.style.width = "816px";
  tempWrapper.style.opacity = "0";
  tempWrapper.style.pointerEvents = "none";
  document.body.appendChild(tempWrapper);

  try {
    await docx.renderAsync(arrayBuffer, tempWrapper, undefined, {
      className: "docx-doc-page",
      inWrapper: false,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
    });

    // Extract all media files from ZIP to guarantee all images have Base64 data URLs
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const mediaFiles = Object.keys(zip.files).filter(
        (path) => path.startsWith("word/media/") && !zip.files[path].dir
      );

      const imageMap: Record<string, string> = {};
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

      const imgs = tempWrapper.querySelectorAll("img");
      imgs.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !src.startsWith("data:")) {
          const matchingKey = Object.keys(imageMap).find((k) =>
            src.includes(k)
          );
          if (matchingKey) {
            img.setAttribute("src", imageMap[matchingKey]);
          }
        }
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
      });
    } catch (zipErr) {
      console.warn("Could not inspect zip media:", zipErr);
    }

    // Format all tables in the rendered DOM to guarantee intact 2-column borders and styling
    const tables = tempWrapper.querySelectorAll("table");
    tables.forEach((tbl) => {
      tbl.style.width = "100%";
      tbl.style.borderCollapse = "collapse";
      tbl.style.margin = "14px 0";
      tbl.style.fontSize = "11.5px";

      const rows = tbl.querySelectorAll("tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td, th");
        cells.forEach((cell) => {
          const c = cell as HTMLElement;
          c.style.border = "1px solid #d1d5db";
          c.style.padding = "7px 10px";
          c.style.verticalAlign = "middle";
        });
      });
    });

    // Style all links to coral color with word break
    const links = tempWrapper.querySelectorAll("a");
    links.forEach((a) => {
      a.style.color = "#eb5454";
      a.style.textDecoration = "underline";
      a.style.wordBreak = "break-all";
    });

    // Extract pages: docx-preview creates section.docx-doc-page or section for each page
    const sections = tempWrapper.querySelectorAll(
      "section, article, .docx-wrapper > section"
    );

    const pages: string[] = [];

    if (sections.length > 0) {
      sections.forEach((sec) => {
        const content = sec.innerHTML;
        if (content.trim().length > 0) {
          pages.push(content);
        }
      });
    }

    if (pages.length > 0) {
      return pages;
    }

    return [tempWrapper.innerHTML];
  } finally {
    if (tempWrapper.parentNode) {
      tempWrapper.parentNode.removeChild(tempWrapper);
    }
  }
}
