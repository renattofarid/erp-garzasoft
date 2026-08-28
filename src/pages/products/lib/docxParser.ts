import * as docx from "docx-preview";
import JSZip from "jszip";

export async function parseDocxFileToHtml(
  file: File,
  _productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Create temporary in-memory DOM containers
  const container = document.createElement("div");
  const styleContainer = document.createElement("div");

  // Render docx with full fidelity: all images, watermarks, headers, footers and tables
  await docx.renderAsync(arrayBuffer, container, styleContainer, {
    className: "docx-rendered-doc",
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

  // Extract all inline and background images from zip if needed
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const mediaFiles = Object.keys(zip.files).filter((path) =>
      path.startsWith("word/media/") && !zip.files[path].dir
    );

    // If docx-preview missed any header background / watermark images
    const imageMap: Record<string, string> = {};
    for (const path of mediaFiles) {
      const fileName = path.split("/").pop() || "";
      const base64 = await zip.files[path].async("base64");
      const ext = fileName.split(".").pop()?.toLowerCase() || "png";
      const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/" + ext;
      imageMap[fileName] = `data:${mime};base64,${base64}`;
    }

    // Replace any relative img src with base64 data url
    const imgs = container.querySelectorAll("img");
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !src.startsWith("data:")) {
        const matchingKey = Object.keys(imageMap).find((k) => src.includes(k));
        if (matchingKey) {
          img.setAttribute("src", imageMap[matchingKey]);
        }
      }
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "inline-block";
    });
  } catch (err) {
    console.warn("Could not inspect zip media files:", err);
  }

  // Extract pages: docx-preview divides into section.docx-section or article or wrapper
  const sections = container.querySelectorAll("section, article, .docx-wrapper > section");

  if (sections.length > 0) {
    let resultHtml = "";
    sections.forEach((sec) => {
      // Remove any unwanted page-break margins inside the sheet
      const content = sec.innerHTML;
      if (content.trim().length > 0) {
        resultHtml += `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 45px 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
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

  // Fallback single sheet
  return `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 45px 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${container.innerHTML}
  </div>
</div>
`;
}
