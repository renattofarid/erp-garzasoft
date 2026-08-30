/**
 * Slices arbitrary HTML into individual A4 pages based on real rendered DOM height.
 * Inner printable A4 height is ~680px (1123px - top/bottom margins - header/footer).
 */
export function paginateHtmlByA4Height(
  htmlContent: string,
  maxPageHeight: number = 680
): string[] {
  if (!htmlContent || htmlContent.trim() === "") {
    return ["<p></p>"];
  }

  // 1. Create in-DOM measurement sandbox with exact A4 sheet printable width
  const measureContainer = document.createElement("div");
  measureContainer.style.position = "fixed";
  measureContainer.style.left = "-9999px";
  measureContainer.style.top = "-9999px";
  measureContainer.style.width = "690px"; // Inner printable width of A4
  measureContainer.style.fontSize = "12.5px";
  measureContainer.style.lineHeight = "1.55";
  measureContainer.style.fontFamily = "Arial, Helvetica, sans-serif";
  measureContainer.style.boxSizing = "border-box";
  measureContainer.innerHTML = htmlContent;
  document.body.appendChild(measureContainer);

  const pages: string[] = [];
  let currentPageElements: string[] = [];
  let currentAccumulatedHeight = 0;

  // Flatten container children
  let childNodes = Array.from(measureContainer.children) as HTMLElement[];
  if (childNodes.length === 1 && childNodes[0].children.length > 1) {
    childNodes = Array.from(childNodes[0].children) as HTMLElement[];
  }

  childNodes.forEach((el) => {
    // Check for explicit page break
    if (el.classList.contains("page-break") || el.tagName.toLowerCase() === "hr") {
      if (currentPageElements.length > 0) {
        pages.push(currentPageElements.join("\n"));
        currentPageElements = [];
        currentAccumulatedHeight = 0;
      }
      return;
    }

    // Split large tables across pages if table is taller than maxPageHeight
    if (el.tagName.toLowerCase() === "table") {
      let theadHtml = el.querySelector("thead")?.outerHTML || "";
      let tbodyRows = Array.from(el.querySelectorAll("tbody tr"));
      if (tbodyRows.length === 0) {
        const allRows = Array.from(el.querySelectorAll("tr"));
        if (allRows.length > 1) {
          const firstRow = allRows[0];
          if (firstRow.querySelector("th") || firstRow.innerHTML.includes("#eb5454")) {
            theadHtml = `<thead>${firstRow.outerHTML}</thead>`;
            tbodyRows = allRows.slice(1);
          } else {
            tbodyRows = allRows;
          }
        } else {
          tbodyRows = allRows;
        }
      }

      const tableStyle = el.getAttribute("style") || "width: 100%; border-collapse: collapse;";

      if (tbodyRows.length > 2) {
        let chunkRows: string[] = [];
        let chunkHeight = 0;

        tbodyRows.forEach((row) => {
          const rowHeight = (row as HTMLElement).offsetHeight || 36;
          if (
            currentAccumulatedHeight + chunkHeight + rowHeight > maxPageHeight &&
            (chunkRows.length > 0 || currentPageElements.length > 0)
          ) {
            if (chunkRows.length > 0) {
              currentPageElements.push(
                `<table style="${tableStyle}">${theadHtml}<tbody>${chunkRows.join("")}</tbody></table>`
              );
            }
            if (currentPageElements.length > 0) {
              pages.push(currentPageElements.join("\n"));
            }
            currentPageElements = [];
            currentAccumulatedHeight = 0;
            chunkRows = [row.outerHTML];
            chunkHeight = rowHeight;
          } else {
            chunkRows.push(row.outerHTML);
            chunkHeight += rowHeight;
          }
        });

        if (chunkRows.length > 0) {
          currentPageElements.push(
            `<table style="${tableStyle}">${theadHtml}<tbody>${chunkRows.join("")}</tbody></table>`
          );
          currentAccumulatedHeight += chunkHeight;
        }
        return;
      }
    }

    const h = el.offsetHeight || 30;

    // Check if adding this element exceeds page boundary
    if (currentAccumulatedHeight + h > maxPageHeight && currentPageElements.length > 0) {
      pages.push(currentPageElements.join("\n"));
      currentPageElements = [el.outerHTML];
      currentAccumulatedHeight = h;
    } else {
      currentPageElements.push(el.outerHTML);
      currentAccumulatedHeight += h;
    }
  });

  if (currentPageElements.length > 0) {
    pages.push(currentPageElements.join("\n"));
  }

  document.body.removeChild(measureContainer);

  return pages.length > 0 ? pages : [htmlContent];
}
