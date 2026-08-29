import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function parsePdfFileToPages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // High resolution 2x

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      const renderContext: any = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      await page.render(renderContext).promise;
      const pageDataUrl = canvas.toDataURL("image/png");

      // Extract text content for text overlay or fallback
      const textContent = await page.getTextContent();
      const textItems = textContent.items
        .map((item: any) => item.str)
        .filter((str: string) => str.trim().length > 0);

      // Create high-res editable page with rendered background and overlay
      const pageHtml = `
<div style="position: relative; width: 100%; min-height: 980px; text-align: center;">
  <img src="${pageDataUrl}" alt="Página ${pageNum}" style="width: 100%; max-width: 720px; height: auto; margin: 0 auto; display: block; border-radius: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);" />
  <div style="margin-top: 14px; font-size: 11px; color: #888; display: none;">
    ${textItems.join(" ")}
  </div>
</div>
`;
      pages.push(pageHtml);
    }
  }

  return pages.length > 0 ? pages : ["<p></p>"];
}
