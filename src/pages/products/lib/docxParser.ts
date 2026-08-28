import * as docx from "docx-preview";
import mammoth from "mammoth";
import JSZip from "jszip";

export async function parseDocxFileToHtml(
  file: File,
  productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Extract all media files from the docx ZIP package upfront
  const imageMap: Record<string, string> = {};
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaFiles = Object.keys(zip.files).filter(
      (path) => path.startsWith("word/media/") && !zip.files[path].dir
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
          : ext === "gif"
          ? "image/gif"
          : "image/" + ext;
      imageMap[fileName] = `data:${mime};base64,${base64}`;
      imageMap[path] = `data:${mime};base64,${base64}`;
    }
  } catch (err) {
    console.warn("Could not read docx zip media:", err);
  }

  // Method 1: High fidelity render with docx-preview in an attached container
  try {
    const tempHost = document.createElement("div");
    tempHost.id = "docx-temp-host-" + Date.now();
    tempHost.style.position = "fixed";
    tempHost.style.left = "-99999px";
    tempHost.style.top = "0";
    tempHost.style.width = "794px";
    tempHost.style.visibility = "hidden";
    tempHost.style.pointerEvents = "none";
    document.body.appendChild(tempHost);

    try {
      await docx.renderAsync(arrayBuffer, tempHost, undefined, {
        className: "docx-doc-page",
        inWrapper: true,
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

      // Fix any images that still have relative URLs
      const imgs = tempHost.querySelectorAll("img");
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
      });

      // Extract pages from docx-wrapper
      const sections = tempHost.querySelectorAll(
        ".docx-wrapper > section, section.docx-doc-page, section"
      );

      if (sections.length > 0) {
        let resultHtml = "";
        sections.forEach((sec) => {
          const inner = sec.innerHTML;
          if (inner && inner.trim().length > 0) {
            resultHtml += `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 45px 50px; background: #ffffff; margin: 0 auto 32px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${inner}
  </div>
</div>
`;
          }
        });

        if (resultHtml.trim().length > 0) {
          return resultHtml;
        }
      }
    } finally {
      if (tempHost.parentNode) {
        tempHost.parentNode.removeChild(tempHost);
      }
    }
  } catch (docxErr) {
    console.warn("docx-preview failed, using Mammoth in-place image converter:", docxErr);
  }

  // Method 2: Precise in-place extraction using Mammoth
  // This extracts all images IN-PLACE inside their exact paragraphs and tables
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(function (image: any) {
      return image.read("base64").then(function (imageBuffer: string) {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
          style:
            "max-width: 100%; height: auto; display: inline-block; margin: 8px 0; border-radius: 4px;",
        };
      });
    }),
    styleMap: [
      "p[style-name='Title'] => h1.doc-title:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "table => table.a4-table:fresh",
      "br[type='page'] => hr.page-break:fresh",
    ],
  };

  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    mammothOptions
  );
  let html = mammothResult.value;

  if (!html || html.trim() === "") {
    throw new Error("No se pudo extraer contenido del archivo Word.");
  }

  // Split into page sheets if page breaks or major headings exist
  let pages: string[] = [];
  if (
    html.includes('<hr class="page-break" />') ||
    html.includes("<hr />") ||
    html.includes("<hr>")
  ) {
    pages = html
      .split(/<hr(?:\s+class="page-break")?\s*\/?>/i)
      .filter((p) => p.trim().length > 0);
  } else {
    // Split by headings or group paragraphs
    const parts = html
      .split(/(?=<h[1-2][^>]*>)/i)
      .filter((p) => p.trim().length > 0);
    if (parts.length > 1) {
      pages = parts;
    } else {
      const blockRegex = /(<(?:p|table|ul|ol|div)[^>]*>[\s\S]*?<\/(?:p|table|ul|ol|div)>)/gi;
      const allBlocks = html.match(blockRegex) || [html];
      const chunkSize = 5;
      for (let i = 0; i < allBlocks.length; i += chunkSize) {
        pages.push(allBlocks.slice(i, i + chunkSize).join(""));
      }
    }
  }

  if (pages.length === 0) {
    pages = [html];
  }

  const totalPages = pages.length;
  return pages
    .map((pageContent, idx) => {
      const pageNum = idx + 1;
      return `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 32px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div style="text-align: right; margin-bottom: 22px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
  </div>

  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${pageContent}
  </div>

  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">${pageNum} / ${totalPages}</span>
    <div style="clear: both;"></div>
  </div>
</div>
`;
    })
    .join("\n");
}
