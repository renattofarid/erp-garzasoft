import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronLeft,
  ChevronRight,
  Columns,
  Copy,
  Eye,
  FileSpreadsheet,
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
  Rows,
  Save,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  UploadCloud,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: "",
  });

  // Extract pages from raw saved html or use defaults
  const extractPagesFromHtml = (htmlContent?: string): string[] => {
    if (!htmlContent || htmlContent.trim() === "") {
      return getDefaultGesrestPages(product?.nombre || "GESREST");
    }

    // Check if contains .a4-page-sheet divs
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const sheets = temp.querySelectorAll(".a4-page-sheet");

    if (sheets.length > 0) {
      const extracted: string[] = [];
      sheets.forEach((sheet) => {
        // Look for page-content or imported-word-page-content or innerHTML
        const inner =
          sheet.querySelector(".page-content")?.innerHTML ||
          sheet.querySelector(".imported-word-page-content")?.innerHTML ||
          sheet.innerHTML;
        extracted.push(inner);
      });
      return extracted.length > 0 ? extracted : [htmlContent];
    }

    // If split by page breaks
    if (htmlContent.includes('<hr class="page-break" />') || htmlContent.includes("<hr>")) {
      return htmlContent.split(/<hr(?:\s+class="page-break")?\s*\/?>/i).filter((s) => s.trim().length > 0);
    }

    return [htmlContent];
  };

  useEffect(() => {
    if (open && product && editor) {
      setLoading(true);
      getProductFormatoAlta(product.id)
        .then((res) => {
          const rawFormato = res?.data?.formato_alta;
          const initialPages = extractPagesFromHtml(rawFormato?.html_content);
          setPages(initialPages);
          setCurrentPageIndex(0);
          editor.commands.setContent(initialPages[0] || "<p></p>");
        })
        .catch(() => {
          const defaultPages = getDefaultGesrestPages(product.nombre);
          setPages(defaultPages);
          setCurrentPageIndex(0);
          editor.commands.setContent(defaultPages[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, product, editor]);

  // Sync current editor changes into pages state before changing page or saving
  const syncCurrentPage = (): string[] => {
    if (!editor) return pages;
    const currentHtml = editor.getHTML();
    const updated = [...pages];
    updated[currentPageIndex] = currentHtml;
    setPages(updated);
    return updated;
  };

  const handleSelectPage = (targetIdx: number) => {
    if (!editor || targetIdx === currentPageIndex || targetIdx < 0 || targetIdx >= pages.length) return;
    const updatedPages = syncCurrentPage();
    setCurrentPageIndex(targetIdx);
    editor.commands.setContent(updatedPages[targetIdx] || "<p></p>");
  };

  const handleAddPage = () => {
    if (!editor) return;
    const updated = syncCurrentPage();
    const newPageContent = `
<div style="text-align: right; margin-bottom: 25px;">
  <span style="font-size: 16px; font-weight: 700; color: #eb5454;">${product?.nombre || "PRODUCTO"}</span><br>
  <span style="font-size: 10px; color: #888;">Tu restaurante digital</span>
</div>
<h2 style="color: #eb5454; font-size: 16px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">NUEVA SECCIÓN</h2>
<p style="font-size: 12px; line-height: 1.6;">Escribe aquí el contenido de esta nueva página...</p>
`;
    const newPagesList = [...updated, newPageContent];
    const newIdx = newPagesList.length - 1;
    setPages(newPagesList);
    setCurrentPageIndex(newIdx);
    editor.commands.setContent(newPageContent);
    successToast(`Página ${newPagesList.length} agregada.`);
  };

  const handleDuplicatePage = () => {
    if (!editor) return;
    const updated = syncCurrentPage();
    const currentContent = updated[currentPageIndex];
    const newPagesList = [
      ...updated.slice(0, currentPageIndex + 1),
      currentContent,
      ...updated.slice(currentPageIndex + 1),
    ];
    setPages(newPagesList);
    setCurrentPageIndex(currentPageIndex + 1);
    editor.commands.setContent(currentContent);
    successToast(`Página duplicada exitosamente.`);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      errorToast("El documento debe tener al menos una página.");
      return;
    }
    if (!confirm(`¿Eliminar la Página ${currentPageIndex + 1}?`)) return;

    const updated = [...pages];
    updated.splice(currentPageIndex, 1);
    const newIdx = Math.max(0, currentPageIndex - 1);
    setPages(updated);
    setCurrentPageIndex(newIdx);
    editor?.commands.setContent(updated[newIdx] || "<p></p>");
    successToast(`Página eliminada.`);
  };

  const handleDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor || !product) return;

    if (!file.name.endsWith(".docx")) {
      errorToast("Por favor selecciona un archivo de Microsoft Word válido (.docx)");
      return;
    }

    setImportingDocx(true);
    try {
      const fullHtml = await parseDocxFileToHtml(file, product.nombre);
      const parsedPages = extractPagesFromHtml(fullHtml);

      setPages(parsedPages);
      setCurrentPageIndex(0);
      editor.commands.setContent(parsedPages[0] || "<p></p>");
      successToast(
        `Documento Word importado con éxito: ${parsedPages.length} página(s) generadas con todas las imágenes y tablas.`
      );
    } catch (err: any) {
      errorToast(err.message || "Error al procesar el archivo Word.");
    } finally {
      setImportingDocx(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetTemplate = () => {
    if (!product || !editor) return;
    if (confirm("¿Deseas restablecer la plantilla con las 8 páginas originales de Gesrest?")) {
      const defaultPages = getDefaultGesrestPages(product.nombre);
      setPages(defaultPages);
      setCurrentPageIndex(0);
      editor.commands.setContent(defaultPages[0]);
      successToast("Plantilla base de 8 páginas restablecida.");
    }
  };

  const handleSave = async () => {
    if (!product || !editor) return;
    setSaving(true);
    try {
      const updatedPages = syncCurrentPage();
      const total = updatedPages.length;

      // Wrap all pages into .a4-page-sheet containers
      const combinedHtml = updatedPages
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

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Ingresa la URL del enlace:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt("Ingresa la URL de la imagen:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-7xl h-[94vh] max-h-[94vh] p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-background text-foreground flex flex-col sm:max-w-7xl">
        {/* Input oculto para carga de archivos Word (.docx) */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".docx"
          className="hidden"
          onChange={handleDocxUpload}
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
                Documento paginado en hojas físicas A4 con herramientas de Microsoft Word.
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
            >
              {importingDocx ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>Cargar Word (.docx)</span>
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
        {editor && (
          <div className="px-4 py-1.5 border-b bg-muted/60 dark:bg-zinc-900 flex flex-wrap items-center gap-1 shrink-0 select-none">
            {/* Deshacer / Rehacer */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Encabezados y Jerarquía */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs font-semibold"
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Párrafo
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Formato de Texto */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("bold") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("italic") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("underline") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("strike") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleStrike().run()}
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
                      onClick={() => editor.chain().focus().setColor(c.color).run()}
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
                      onClick={() => editor.chain().focus().toggleHighlight({ color: c.color }).run()}
                      className="h-6 w-full rounded border border-border transition-transform hover:scale-110"
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                  <button
                    type="button"
                    title="Quitar resaltado"
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                    className="h-6 w-full rounded border border-dashed border-border text-[10px] flex items-center justify-center text-muted-foreground"
                  >
                    Borrar
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Alineación */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Listas */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Tablas Avanzadas */}
            <div className="flex items-center gap-1 pr-2 border-r border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 font-medium">
                    <TableIcon className="h-3.5 w-3.5 text-primary" />
                    <span>Tabla</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    onClick={() =>
                      editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()
                    }
                  >
                    <TableIcon className="mr-2 h-4 w-4" /> Insertar Tabla 3x2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                    <Rows className="mr-2 h-4 w-4" /> Agregar Fila
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Eliminar Fila
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                    <Columns className="mr-2 h-4 w-4" /> Agregar Columna
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Eliminar Columna
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive font-semibold" /> Eliminar Tabla
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Elementos & Enlaces */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={editor.isActive("link") ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={setLink}
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={addImage}
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                title="Limpiar Formato"
              >
                <RemoveFormatting className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Page Navigator Strip (Selector de Páginas A4) */}
        <div className="px-4 py-2 border-b bg-muted/80 dark:bg-zinc-900/90 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 pr-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={currentPageIndex === 0}
              onClick={() => handleSelectPage(currentPageIndex - 1)}
              title="Página Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pages.map((_, idx) => (
              <Button
                key={idx}
                type="button"
                variant={idx === currentPageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectPage(idx)}
                className={`h-7 px-3 text-xs font-semibold shrink-0 transition-all ${
                  idx === currentPageIndex
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>Pág. {idx + 1}</span>
              </Button>
            ))}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={currentPageIndex === pages.length - 1}
              onClick={() => handleSelectPage(currentPageIndex + 1)}
              title="Página Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPage}
              className="h-7 px-2.5 text-xs font-medium gap-1 text-primary hover:bg-primary/10 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Agregar Página</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDuplicatePage}
              title="Duplicar esta página"
              className="h-7 w-7 text-muted-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDeletePage}
              title="Eliminar esta página"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              disabled={pages.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Word Document Canvas (Mesa de Trabajo Gris de Oficina con Hoja A4 Centrada) */}
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
                  : "Cargando página A4 en el editor..."}
              </span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center focus:outline-none">
              {/* Hoja Física A4 con Dimensiones y Sombra Realista */}
              <div
                className="w-full max-w-[800px] min-h-[1060px] bg-white text-zinc-900 rounded-sm shadow-2xl relative transition-all"
                style={{
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.2)",
                  padding: "50px 60px 65px 60px",
                  boxSizing: "border-box",
                }}
              >
                <style>{`
                  .ProseMirror {
                    outline: none;
                    min-height: 900px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 13px;
                    line-height: 1.55;
                    color: #111827 !important;
                  }
                  .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 14px 0;
                  }
                  .ProseMirror td, .ProseMirror th {
                    min-width: 1em;
                    border: 1px solid #d1d5db;
                    padding: 7px 10px;
                    vertical-align: top;
                    box-sizing: border-box;
                    color: #111827 !important;
                  }
                  .ProseMirror th {
                    font-weight: bold;
                    text-align: center;
                    background-color: #eb5454 !important;
                    color: #ffffff !important;
                  }
                  .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(235, 84, 84, 0.15);
                    pointer-events: none;
                  }
                  .ProseMirror a {
                    color: #eb5454;
                    text-decoration: underline;
                  }
                  .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
                    color: #eb5454;
                    margin-top: 0;
                  }
                  .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 12px auto;
                    display: block;
                  }
                  .ProseMirror p {
                    margin: 0 0 8px 0;
                    color: #111827 !important;
                  }
                `}</style>
                <EditorContent editor={editor} />

                {/* Pie de Página Fijo en la Hoja A4 */}
                <div
                  className="absolute bottom-6 left-14 right-14 border-t border-zinc-200 pt-2 text-[10px] text-zinc-500 flex items-center justify-between select-none pointer-events-none"
                >
                  <span>Un producto de Mr. Soft</span>
                  <span className="font-semibold">
                    Página {currentPageIndex + 1} de {pages.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
