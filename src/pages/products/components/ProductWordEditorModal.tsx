import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eye,
  FileSpreadsheet,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Palette,
  Plus,
  Redo,
  RefreshCw,
  RemoveFormatting,
  Save,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo,
  UploadCloud,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { errorToast, successToast } from "@/lib/core.function";
import { openPdfFromFetcher } from "@/lib/pdf";
import {
  getFormatoAltaPdfBlob,
  getProductFormatoAlta,
  updateProductFormatoAlta,
} from "../lib/product.actions";
import { ProductResource } from "../lib/product.interface";
import { getDefaultGesrestPages } from "../lib/defaultGesrestHtml";
import { parseDocxFileToHtml } from "../lib/docxParser";
import { parsePdfFileToPages } from "../lib/pdfParser";
import { paginateHtmlByA4Height } from "../lib/a4Paginator";
import { PageSheetItem } from "./PageSheetItem";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResource | null;
}

export default function ProductWordEditorModal({
  open,
  onOpenChange,
  product,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importingDocx, setImportingDocx] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Array of individual A4 pages
  const [pages, setPages] = useState<string[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Extract pages from raw saved html or use defaults
  const extractPagesFromHtml = (htmlContent?: string): string[] => {
    if (!htmlContent || htmlContent.trim() === "") {
      return getDefaultGesrestPages(product?.nombre || "GESREST");
    }
    return paginateHtmlByA4Height(htmlContent, 860);
  };

  useEffect(() => {
    if (open && product) {
      setLoading(true);
      getProductFormatoAlta(product.id)
        .then((res) => {
          const rawFormato = res?.data?.formato_alta;
          const initialPages = extractPagesFromHtml(rawFormato?.html_content);
          setPages(initialPages);
          setActivePageIndex(0);
        })
        .catch(() => {
          const defaultPages = getDefaultGesrestPages(product.nombre);
          setPages(defaultPages);
          setActivePageIndex(0);
        })
        .finally(() => setLoading(false));
    }
  }, [open, product]);

  const handlePageChange = (index: number, newHtml: string) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = newHtml;
      return copy;
    });
  };

  const scrollToPage = (targetIdx: number) => {
    setActivePageIndex(targetIdx);
    const element = document.getElementById(`page-sheet-${targetIdx}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddPageBelow = (fromIndex: number) => {
    const newPageContent = `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${product?.nombre || "PRODUCTO"}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>
<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">NUEVA SECCIÓN</h2>
<p style="font-size: 12px; line-height: 1.6;">Escribe aquí el contenido de esta nueva página...</p>
`;
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(fromIndex + 1, 0, newPageContent);
      return copy;
    });
    setTimeout(() => scrollToPage(fromIndex + 1), 100);
    successToast(`Nueva página agregada.`);
  };

  const handleDuplicatePage = (fromIndex: number) => {
    const content = pages[fromIndex];
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(fromIndex + 1, 0, content);
      return copy;
    });
    setTimeout(() => scrollToPage(fromIndex + 1), 100);
    successToast(`Página duplicada exitosamente.`);
  };

  const handleDeletePage = (fromIndex: number) => {
    if (pages.length <= 1) {
      if (confirm("¿Deseas vaciar esta página y dejarla en blanco?")) {
        setPages(["<p style='font-size: 13px; line-height: 1.6;'>Escribe aquí tu contenido...</p>"]);
        successToast("Página vaciada.");
      }
      return;
    }
    if (!confirm(`¿Eliminar la Página ${fromIndex + 1}?`)) return;

    setPages((prev) => {
      const copy = [...prev];
      copy.splice(fromIndex, 1);
      return copy;
    });
    const newIdx = Math.max(0, fromIndex - 1);
    setTimeout(() => scrollToPage(newIdx), 100);
    successToast(`Página ${fromIndex + 1} eliminada.`);
  };

  const handleClearAllToBlank = () => {
    if (
      confirm(
        "¿Deseas eliminar todas las páginas del documento y empezar con una sola hoja A4 en blanco?"
      )
    ) {
      setPages([
        `<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${product?.nombre || "PRODUCTO"}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>
<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">TÍTULO PRINCIPAL</h2>
<p style="font-size: 13px; line-height: 1.6;">Escribe aquí el contenido del documento...</p>`,
      ]);
      setActivePageIndex(0);
      setTimeout(() => scrollToPage(0), 100);
      successToast("Documento vaciado a una sola hoja en blanco.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    const isDocx = file.name.toLowerCase().endsWith(".docx");
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    if (!isDocx && !isPdf) {
      errorToast("Por favor selecciona un archivo válido de Microsoft Word (.docx) o PDF (.pdf)");
      return;
    }

    setImportingDocx(true);
    try {
      let parsedPages: string[] = [];

      if (isPdf) {
        parsedPages = await parsePdfFileToPages(file);
        successToast(
          `Documento PDF importado: ${parsedPages.length} página(s) A4 generadas con fidelidad visual 100%.`
        );
      } else {
        parsedPages = await parseDocxFileToHtml(file, product.nombre);
        successToast(
          `Documento Word importado: ${parsedPages.length} página(s) A4 generadas con todas las imágenes y tablas.`
        );
      }

      setPages(parsedPages);
      setActivePageIndex(0);
      setTimeout(() => scrollToPage(0), 100);
    } catch (err: any) {
      errorToast(err.message || "Error al procesar el archivo.");
    } finally {
      setImportingDocx(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetTemplate = () => {
    if (!product) return;
    if (confirm("¿Deseas restablecer la plantilla con las 8 páginas originales de Gesrest?")) {
      const defaultPages = getDefaultGesrestPages(product.nombre);
      setPages(defaultPages);
      setActivePageIndex(0);
      setTimeout(() => scrollToPage(0), 100);
      successToast("Plantilla base de 8 páginas restablecida.");
    }
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const total = pages.length;

      // Wrap all pages into .a4-page-sheet containers for DomPDF backend
      const combinedHtml = pages
        .map(
          (content, idx) => `
<div class="a4-page-sheet" style="min-height: 1050px; position: relative; padding: 50px; background: #ffffff; margin: 0 auto 30px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.12); page-break-after: always; box-sizing: border-box;">
  <div class="page-content" style="font-size: 12px; line-height: 1.5; color: #1a1a1a;">
    ${content}
  </div>
  <div style="position: absolute; bottom: 35px; left: 50px; right: 50px; border-top: 1px solid #ddd; padding-top: 6px; font-size: 10px; color: #777;">
    <span style="float: left;">Un producto de Mr. Soft</span>
    <span style="float: right;">${idx + 1} / ${total}</span>
    <div style="clear: both;"></div>
  </div>
</div>
`
        )
        .join("\n");

      await updateProductFormatoAlta(product.id, {
        html_content: combinedHtml,
      });
      successToast("Formato de alta guardado exitosamente.");
    } catch {
      errorToast("Error al guardar el formato de alta.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!product) return;
    try {
      await openPdfFromFetcher(
        () => getFormatoAltaPdfBlob(product.id),
        `Generando PDF de ${product.nombre}...`
      );
    } catch (err: any) {
      errorToast(err.message || "No se pudo abrir el PDF.");
    }
  };

  const exec = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
  };

  const setLink = () => {
    const url = window.prompt("Ingresa la URL del enlace:");
    if (url) {
      exec("createLink", url);
    }
  };

  const addImage = () => {
    const url = window.prompt("Ingresa la URL de la imagen:");
    if (url) {
      exec("insertImage", url);
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 14px 0; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #eb5454; color: #fff;">
            <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Columna 1</th>
            <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Columna 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Dato 1</td>
            <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Dato 2</td>
          </tr>
          <tr style="background-color: #fafafa;">
            <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Dato 3</td>
            <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">Dato 4</td>
          </tr>
        </tbody>
      </table>
    `;
    exec("insertHTML", tableHtml);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-7xl h-[94vh] max-h-[94vh] p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-background text-foreground flex flex-col sm:max-w-7xl">
        {/* Input oculto para carga de archivos Word (.docx) o PDF (.pdf) */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".docx,.pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Cabecera Principal */}
        <DialogHeader className="px-5 py-3 border-b bg-card flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Editor de Formato de Alta: {product?.nombre}</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Vista de impresión vertical continua en hojas A4 con herramientas de Microsoft Word.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importingDocx || loading}
              className="text-xs gap-1.5 h-8 font-semibold text-primary border-primary/40 hover:bg-primary/10 shadow-2xs"
              title="Cargar archivo Word (.docx) o PDF (.pdf)"
            >
              {importingDocx ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>Cargar Word / PDF</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAllToBlank}
              className="text-xs gap-1.5 h-8 font-medium shadow-2xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              title="Eliminar todo y empezar con una sola hoja en blanco"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Hoja en Blanco</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetTemplate}
              className="text-xs gap-1.5 h-8 font-medium shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Plantilla Gesrest</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviewPdf}
              className="text-xs gap-1.5 h-8 font-semibold hover:bg-primary hover:text-primary-foreground shadow-2xs"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver PDF</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading || importingDocx}
              className="text-xs gap-1.5 h-8 font-bold shadow-xs"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Guardar</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Word Ribbon Toolbar */}
        <div className="px-4 py-1.5 border-b bg-muted/60 dark:bg-zinc-900 flex flex-wrap items-center gap-1 shrink-0 select-none">
          {/* Deshacer / Rehacer */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("undo")}
              title="Deshacer"
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("redo")}
              title="Rehacer"
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Encabezados y Jerarquía */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold"
              onClick={() => exec("formatBlock", "<p>")}
            >
              Párrafo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("formatBlock", "<h1>")}
              title="Título Principal H1"
            >
              <Heading1 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("formatBlock", "<h2>")}
              title="Subtítulo H2"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("formatBlock", "<h3>")}
              title="Encabezado H3"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Formato de Texto */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("bold")}
              title="Negrita"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("italic")}
              title="Cursiva"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("underline")}
              title="Subrayado"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("strikeThrough")}
              title="Tachado"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Colores de Texto y Resaltador */}
          <div className="flex items-center gap-1 pr-2 border-r border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <span>Color</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 grid grid-cols-4 gap-1.5 w-44">
                {[
                  { label: "Coral Gesrest", color: "#eb5454" },
                  { label: "Azul Primario", color: "#0284c7" },
                  { label: "Verde Éxito", color: "#16a34a" },
                  { label: "Negro", color: "#111827" },
                  { label: "Gris", color: "#6b7280" },
                  { label: "Púrpura", color: "#9333ea" },
                  { label: "Naranja", color: "#ea580c" },
                  { label: "Dorado", color: "#ca8a04" },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onClick={() => exec("foreColor", c.color)}
                    className="h-6 w-full rounded border border-border flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                  <Highlighter className="h-3.5 w-3.5 text-amber-500" />
                  <span>Resaltar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 grid grid-cols-3 gap-1.5 w-36">
                {[
                  { label: "Amarillo", color: "#fef08a" },
                  { label: "Coral Suave", color: "#fecaca" },
                  { label: "Verde Suave", color: "#bbf7d0" },
                  { label: "Azul Suave", color: "#bae6fd" },
                  { label: "Púrpura Suave", color: "#e9d5ff" },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onClick={() => exec("hiliteColor", c.color)}
                    className="h-6 w-full rounded border border-border transition-transform hover:scale-110"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Alineación */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("justifyLeft")}
              title="Alinear a la Izquierda"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("justifyCenter")}
              title="Centrar"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("justifyRight")}
              title="Alinear a la Derecha"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("justifyFull")}
              title="Justificar"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Listas */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("insertUnorderedList")}
              title="Viñetas"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => exec("insertOrderedList")}
              title="Lista Numerada"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Tablas Avanzadas */}
          <div className="flex items-center gap-1 pr-2 border-r border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="h-7 px-2 text-xs gap-1 font-medium"
            >
              <TableIcon className="h-3.5 w-3.5 text-primary" />
              <span>+ Insertar Tabla</span>
            </Button>
          </div>

          {/* Elementos & Enlaces */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={setLink}
              title="Insertar Enlace"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={addImage}
              title="Insertar Imagen por URL"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => exec("removeFormat")}
              title="Limpiar Formato"
            >
              <RemoveFormatting className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Page Quick Navigator Strip (Saltar a Página) */}
        <div className="px-4 py-2 border-b bg-muted/80 dark:bg-zinc-900/90 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 pr-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Saltar a:</span>
            {pages.map((_, idx) => (
              <Button
                key={idx}
                type="button"
                variant={idx === activePageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => scrollToPage(idx)}
                className={`h-7 px-3 text-xs font-semibold shrink-0 transition-all ${
                  idx === activePageIndex
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>Pág. {idx + 1}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddPageBelow(pages.length - 1)}
              className="h-7 px-2.5 text-xs font-medium gap-1 text-primary hover:bg-primary/10 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Nueva Página al Final</span>
            </Button>
          </div>
        </div>

        {/* Word Document Canvas (Mesa de Trabajo Gris con Todas las Hojas A4 en Scroll Vertical) */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-10 flex flex-col items-center justify-start"
          style={{ backgroundColor: "#525659" }}
        >
          {loading || importingDocx ? (
            <div className="flex min-h-[450px] flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
              <span className="text-sm font-semibold tracking-wide">
                {importingDocx
                  ? "Procesando documento Word, extrayendo imágenes y paginando..."
                  : "Cargando páginas A4 en el editor..."}
              </span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center focus:outline-none py-2">
              {pages.map((content, idx) => (
                <PageSheetItem
                  key={idx}
                  pageIndex={idx}
                  totalPages={pages.length}
                  content={content}
                  isActive={idx === activePageIndex}
                  onFocus={() => setActivePageIndex(idx)}
                  onChange={(newHtml) => handlePageChange(idx, newHtml)}
                  onAddBelow={() => handleAddPageBelow(idx)}
                  onDuplicate={() => handleDuplicatePage(idx)}
                  onDelete={() => handleDeletePage(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
