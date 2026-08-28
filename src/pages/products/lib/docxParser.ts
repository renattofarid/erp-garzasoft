import * as docx from "docx-preview";
import mammoth from "mammoth";
import JSZip from "jszip";

export async function parseDocxFileToHtml(
  file: File,
  _productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Primary Engine: docx-preview with inWrapper: true (Preserves 100% exact Word geometry, watermarks, shapes, positions)
  try {
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "850px";
    tempContainer.style.opacity = "0";
    tempContainer.style.pointerEvents = "none";
    document.body.appendChild(tempContainer);

    try {
      await docx.renderAsync(arrayBuffer, tempContainer, undefined, {
        className: "docx-page-rendered",
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

      // Extract all media files from ZIP to guarantee all image src are valid base64
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

        const imgs = tempContainer.querySelectorAll("img");
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
        });
      } catch (zipErr) {
        console.warn("Could not inspect zip media:", zipErr);
      }

      // Collect all sections / pages rendered by docx-preview
      const sections = tempContainer.querySelectorAll("section.docx, section.docx-page-rendered, .docx-wrapper > section");

      if (sections.length > 0) {
        let resultHtml = "";
        sections.forEach((sec) => {
          const content = sec.innerHTML;
          if (content.trim().length > 0) {
            // Keep inline styles from docx-preview section (padding, margins, backgrounds)
            const styleAttr = sec.getAttribute("style") || "";
            resultHtml += `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 45px 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box; ${styleAttr}">
  <div class="imported-word-page-content">
    ${content}
  </div>
</div>
`;
          }
        });

        if (resultHtml.trim().length > 0) {
          return resultHtml;
        }
      }

      const wrapper = tempContainer.querySelector(".docx-wrapper");
      if (wrapper && wrapper.innerHTML.trim().length > 0) {
        return wrapper.innerHTML;
      }
    } finally {
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  } catch (docxErr) {
    console.warn("docx-preview failed, using Mammoth inline converter:", docxErr);
  }

  // Secondary Engine: Mammoth with strict inline base64 image converter (NO image dumping)
  const mammothOptions = {
    convertImage: mammoth.images.imgElement(function (image: any) {
      return image.read("base64").then(function (imageBuffer: string) {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
          style: "max-width: 100%; height: auto; display: inline-block; margin: 8px 0;",
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
  const html = mammothResult.value;

  if (!html || html.trim() === "") {
    throw new Error("El archivo Word está vacío o no se pudo extraer contenido.");
  }

  // Split into pages by page-break tags or headings
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

  return pageBlocks
    .map((content) => {
      return `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${content}
  </div>
</div>
`;
    })
    .join("\n");
}
