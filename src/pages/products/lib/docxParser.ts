import mammoth from "mammoth";

export async function parseDocxFileToHtml(
  file: File,
  productName: string = "PRODUCTO"
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const options = {
    styleMap: [
      "p[style-name='Title'] => h1:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Subtitle'] => p.subtitle",
      "table => table.a4-table",
    ],
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, options);
  let html = result.value;

  if (!html || html.trim() === "") {
    throw new Error("El archivo Word está vacío o no se pudo extraer contenido.");
  }

  // If the document has page breaks or multiple large blocks, we can wrap nicely in an A4 sheet
  // Or if it contains custom elements, format as clean .a4-page-sheet
  const formattedSheet = `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always;">
  <div style="text-align: right; margin-bottom: 25px;">
    <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${productName}</span><br>
    <span style="font-size: 10px; color: #888;">Documento Importado de Word</span>
  </div>

  <div class="imported-word-content">
    ${html}
  </div>

  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">1</span>
    <div style="clear: both;"></div>
  </div>
</div>
`;

  return formattedSheet;
}
