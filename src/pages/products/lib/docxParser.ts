import * as docx from "docx-preview";
import mammoth from "mammoth";
import JSZip from "jszip";

export async function parseDocxFileToHtml(
  file: File,
  productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Try high-fidelity rendering with docx-preview in an attached DOM element
  try {
    const tempWrapper = document.createElement("div");
    tempWrapper.style.position = "fixed";
    tempWrapper.style.left = "-9999px";
    tempWrapper.style.top = "-9999px";
    tempWrapper.style.width = "800px";
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

      // Extract all media files from ZIP to ensure no image is left as relative URL
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
          img.style.margin = "10px auto";
        });
      } catch (zipErr) {
        console.warn("Could not inspect zip media:", zipErr);
      }

      const sections = tempWrapper.querySelectorAll(
        "section, article, .docx-wrapper > section"
      );

      if (sections.length > 0) {
        let resultHtml = "";
        sections.forEach((sec, idx) => {
          const content = sec.innerHTML;
          if (content.trim().length > 0) {
            resultHtml += `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 15px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Formato de Alta de Servicio</span>
  </div>
  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${content}
  </div>
  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">${idx + 1} / ${sections.length}</span>
    <div style="clear: both;"></div>
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
      if (tempWrapper.parentNode) {
        tempWrapper.parentNode.removeChild(tempWrapper);
      }
    }
  } catch (docxErr) {
    console.warn("docx-preview failed, falling back to Mammoth + JSZip:", docxErr);
  }

  // Robust fallback with Mammoth and base64 image extraction
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(function (image: any) {
      return image.read("base64").then(function (imageBuffer: string) {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
          style:
            "max-width: 100%; height: auto; margin: 12px auto; display: block; border-radius: 4px;",
        };
      });
    }),
    styleMap: [
      "p[style-name='Title'] => h1.doc-title:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
      "table => table.a4-table:fresh",
      "br[type='page'] => hr.page-break:fresh",
    ],
  };

  const mammothResult = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
  let html = mammothResult.value;

  if (!html || html.trim() === "") {
    throw new Error("El archivo Word está vacío o no se pudo extraer contenido.");
  }

  // Also extract any media files from ZIP that were not in inline text (e.g. watermarks / header logos)
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaFiles = Object.keys(zip.files).filter(
      (path) => path.startsWith("word/media/") && !zip.files[path].dir
    );

    const allExtractedImgs: string[] = [];
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
      const dataUrl = `data:${mime};base64,${base64}`;

      // If this image is not already in the mammoth HTML, prepend or store it
      if (!html.includes(base64.substring(0, 40))) {
        allExtractedImgs.push(
          `<img src="${dataUrl}" alt="${fileName}" style="max-width: 100%; height: auto; margin: 12px auto; display: block; border-radius: 4px;" />`
        );
      }
    }

    if (allExtractedImgs.length > 0) {
      html = `<div style="text-align: center; margin-bottom: 20px;">${allExtractedImgs.join("")}</div>` + html;
    }
  } catch (zipErr) {
    console.warn("Could not check zip for extra media:", zipErr);
  }

  // Split into pages
  let pageBlocks: string[] = [];
  if (
    html.includes('<hr class="page-break" />') ||
    html.includes("<hr />") ||
    html.includes("<hr>")
  ) {
    pageBlocks = html
      .split(/<hr(?:\s+class="page-break")?\s*\/?>/i)
      .filter((b) => b.trim().length > 0);
  } else {
    const parts = html
      .split(/(?=<h[1-2][^>]*>)/i)
      .filter((b) => b.trim().length > 0);
    if (parts.length > 1) {
      pageBlocks = parts;
    } else {
      const blockRegex = /(<(?:p|table|ul|ol|div)[^>]*>[\s\S]*?<\/(?:p|table|ul|ol|div)>)/gi;
      const allElements = html.match(blockRegex) || [html];
      const chunkSize = 6;
      for (let i = 0; i < allElements.length; i += chunkSize) {
        pageBlocks.push(allElements.slice(i, i + chunkSize).join(""));
      }
    }
  }

  if (pageBlocks.length === 0) {
    pageBlocks = [html];
  }

  const totalPages = pageBlocks.length;
  return pageBlocks
    .map((content, idx) => {
      return `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div style="text-align: right; margin-bottom: 20px;">
    <span style="font-size: 15px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Formato de Alta de Servicio</span>
  </div>

  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${content}
  </div>

  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">${idx + 1} / ${totalPages}</span>
    <div style="clear: both;"></div>
  </div>
</div>
`;
    })
    .join("\n");
}
