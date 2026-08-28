"use client";

import { useEffect, useState } from "react";
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
  Columns,
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
  Maximize2,
  Minimize2,
  Minus,
  Palette,
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
import { generateDefaultGesrestHtml } from "../lib/defaultGesrestHtml";

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
  const [fullscreen, setFullscreen] = useState(true);

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
      Image,
    ],
    content: "",
  });

  useEffect(() => {
    if (open && product && editor) {
      setLoading(true);
      getProductFormatoAlta(product.id)
        .then((res) => {
          const rawFormato = res?.data?.formato_alta;
          const html = rawFormato?.html_content || generateDefaultGesrestHtml(product.nombre);
          editor.commands.setContent(html);
        })
        .catch(() => {
          editor.commands.setContent(generateDefaultGesrestHtml(product.nombre));
        })
        .finally(() => setLoading(false));
    }
  }, [open, product, editor]);

  const handleSave = async () => {
    if (!product || !editor) return;
    setSaving(true);
    try {
      const htmlContent = editor.getHTML();
      await updateProductFormatoAlta(product.id, {
        html_content: htmlContent,
      });
      successToast("Formato de alta guardado exitosamente.");
    } catch {
      errorToast("Error al guardar el formato de alta.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplate = () => {
    if (!product || !editor) return;
    if (confirm("¿Deseas restablecer la plantilla con el diseño base de Gesrest? Los cambios actuales no guardados se reemplazarán.")) {
      editor.commands.setContent(generateDefaultGesrestHtml(product.nombre));
      successToast("Plantilla base restablecida.");
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
      <DialogContent
        className={`flex flex-col p-0 gap-0 overflow-hidden bg-background text-foreground transition-all ${
          fullscreen
            ? "fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50"
            : "max-w-6xl h-[90vh] rounded-2xl"
        }`}
      >
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
                Editor enriquecido tipo Word con herramientas avanzadas, membretes, tablas y enlaces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetTemplate}
              className="text-xs gap-1.5 h-8 font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restablecer Plantilla</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviewPdf}
              className="text-xs gap-1.5 h-8 font-semibold hover:bg-primary hover:text-primary-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver PDF</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading}
              className="text-xs gap-1.5 h-8 font-bold shadow-xs"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Guardar</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Word Ribbon Toolbar */}
        {editor && (
          <div className="px-4 py-2 border-b bg-muted/50 dark:bg-zinc-900 flex flex-wrap items-center gap-1.5 shrink-0 select-none">
            {/* Deshacer / Rehacer */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Encabezados y Jerarquía */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2 text-xs font-semibold"
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Párrafo
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Formato de Texto */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("bold") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("italic") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("underline") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("strike") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            {/* Colores de Texto y Resaltador */}
            <div className="flex items-center gap-1 pr-2 border-r border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
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
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
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
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>

            {/* Listas */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-border">
              <Button
                type="button"
                variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>

            {/* Tablas Avanzadas */}
            <div className="flex items-center gap-1 pr-2 border-r border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 font-medium">
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
                className="h-8 w-8"
                onClick={setLink}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={addImage}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Salto de página / Línea"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                title="Limpiar Formato"
              >
                <RemoveFormatting className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Word Document Canvas (Hoja A4) */}
        <div className="flex-1 overflow-y-auto bg-muted/40 dark:bg-zinc-950 p-4 sm:p-8 flex justify-center">
          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Cargando documento en el editor...</span>
            </div>
          ) : (
            <div className="w-full max-w-[850px] min-h-[1100px] bg-card dark:bg-zinc-900 border border-border/80 shadow-lg rounded-xl p-8 sm:p-14 text-foreground prose dark:prose-invert max-w-none focus:outline-none focus:ring-0">
              <style>{`
                .ProseMirror {
                  outline: none;
                  min-height: 900px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                }
                .ProseMirror table {
                  border-collapse: collapse;
                  table-layout: fixed;
                  width: 100%;
                  margin: 16px 0;
                  overflow: hidden;
                }
                .ProseMirror td, .ProseMirror th {
                  min-width: 1em;
                  border: 1px solid #d1d5db;
                  padding: 8px 12px;
                  vertical-align: top;
                  box-sizing: border-box;
                  position: relative;
                }
                .dark .ProseMirror td, .dark .ProseMirror th {
                  border-color: #3f3f46;
                }
                .ProseMirror th {
                  font-weight: bold;
                  text-align: center;
                  background-color: #eb5454;
                  color: #ffffff;
                }
                .ProseMirror .selectedCell:after {
                  z-index: 2;
                  position: absolute;
                  content: "";
                  left: 0; right: 0; top: 0; bottom: 0;
                  background: rgba(200, 200, 255, 0.4);
                  pointer-events: none;
                }
                .ProseMirror a {
                  color: #eb5454;
                  text-decoration: underline;
                }
                .ProseMirror hr {
                  border: none;
                  border-top: 2px dashed #e4e4e7;
                  margin: 32px 0;
                }
                .dark .ProseMirror hr {
                  border-top-color: #27272a;
                }
              `}</style>
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
