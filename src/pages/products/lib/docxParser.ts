import mammoth from "mammoth";

export async function parseDocxFileToHtml(
  file: File,
  productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const options = {
    convertImage: mammoth.images.imgElement(function (image: any) {
      return image.read("base64").then(function (imageBuffer: string) {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
          style: "max-width: 100%; height: auto; margin: 12px auto; display: block; border-radius: 4px;",
        };
      });
    }),
    styleMap: [
      "p[style-name='Title'] => h1.doc-title:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
      "r[style-name='Strong'] => strong",
      "r[style-name='Emphasis'] => em",
      "table => table.a4-table:fresh",
      "br[type='page'] => hr.page-break:fresh",
    ],
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, options);
  let html = result.value;

  if (!html || html.trim() === "") {
    throw new Error("El archivo Word está vacío o no se pudo extraer contenido.");
  }

  // Split into pages if page breaks exist, or partition by major headings/sections
  let pageBlocks: string[] = [];

  if (html.includes('<hr class="page-break" />') || html.includes("<hr />") || html.includes("<hr>")) {
    pageBlocks = html.split(/<hr(?:\s+class="page-break")?\s*\/?>/i).filter((b) => b.trim().length > 0);
  } else {
    // If no explicit page break, split smartly by <h1>, <h2> or group paragraphs/tables
    const parts = html.split(/(?=<h[1-2][^>]*>)/i).filter((b) => b.trim().length > 0);
    if (parts.length > 1) {
      pageBlocks = parts;
    } else {
      // Split every ~4-5 paragraphs/tables into a page
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

  // Wrap each page in a realistic .a4-page-sheet with header and footer
  const totalPages = pageBlocks.length;
  const formattedSheets = pageBlocks
    .map((content, idx) => {
      const pageNum = idx + 1;
      return `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always;">
  <div style="text-align: right; margin-bottom: 22px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Formato de Alta de Servicio</span>
  </div>

  <div class="imported-word-page-content" style="font-size: 12px; line-height: 1.6; color: #222;">
    ${content}
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

  return formattedSheets;
}
