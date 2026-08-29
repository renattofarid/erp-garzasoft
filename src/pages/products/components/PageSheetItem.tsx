import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
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
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend Table elements to preserve all inline styles, backgrounds, widths and alignments
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

interface PageSheetItemProps {
  pageIndex: number;
  totalPages: number;
  content: string;
  isActive: boolean;
  onFocus: (editor: Editor) => void;
  onChange: (html: string) => void;
  onAddBelow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const PageSheetItem: React.FC<PageSheetItemProps> = ({
  pageIndex,
  totalPages,
  content,
  isActive,
  onFocus,
  onChange,
  onAddBelow,
  onDuplicate,
  onDelete,
}) => {
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
      CustomTable.configure({
        resizable: true,
      }),
      CustomTableRow,
      CustomTableHeader,
      CustomTableCell,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      onFocus(editor);
    },
  });

  // Keep content in sync if parent resets or uploads docx
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>");
    }
  }, [content, editor]);

  return (
    <div
      id={`page-sheet-${pageIndex}`}
      className={`w-full max-w-[800px] min-h-[1080px] bg-white text-zinc-900 rounded-sm shadow-2xl relative mb-10 transition-all group ${
        isActive ? "ring-2 ring-primary/60" : "hover:shadow-3xl"
      }`}
      style={{
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.2)",
        padding: "50px 60px 75px 60px",
        boxSizing: "border-box",
      }}
      onClick={() => {
        if (editor) onFocus(editor);
      }}
    >
      {/* Floating Header Actions on Page Sheet */}
      <div className="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white rounded-md shadow-lg px-2 py-1 flex items-center gap-1 z-10 select-none">
        <span className="text-[11px] font-bold px-1.5 text-zinc-300">
          Pág. {pageIndex + 1} de {totalPages}
        </span>
        <div className="h-3 w-px bg-zinc-600 mx-0.5" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddBelow();
          }}
          className="h-6 px-2 text-[10px] text-white hover:bg-zinc-700 hover:text-white gap-1"
        >
          <Plus className="h-3 w-3" />
          <span>Agregar debajo</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicar página"
          className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-700"
        >
          <Copy className="h-3 w-3" />
        </Button>
        {totalPages > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar página"
            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* TipTap Document Area */}
      <style>{`
        #page-sheet-${pageIndex} .ProseMirror {
          outline: none;
          min-height: 920px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #111827 !important;
        }
        #page-sheet-${pageIndex} .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 14px 0;
          border: 1px solid #d1d5db;
        }
        #page-sheet-${pageIndex} .ProseMirror td, #page-sheet-${pageIndex} .ProseMirror th {
          min-width: 1em;
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          vertical-align: middle;
          box-sizing: border-box;
          font-size: 12px;
          color: inherit;
        }
        #page-sheet-${pageIndex} .ProseMirror th {
          font-weight: bold;
          text-align: center;
          background-color: #eb5454;
          color: #ffffff;
        }
        #page-sheet-${pageIndex} .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(235, 84, 84, 0.15);
          pointer-events: none;
        }
        #page-sheet-${pageIndex} .ProseMirror a {
          color: #eb5454;
          text-decoration: underline;
        }
        #page-sheet-${pageIndex} .ProseMirror h1 {
          color: #eb5454;
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 10px 0;
          line-height: 1.2;
        }
        #page-sheet-${pageIndex} .ProseMirror h2 {
          color: #eb5454;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          margin: 16px 0 10px 0;
          line-height: 1.3;
        }
        #page-sheet-${pageIndex} .ProseMirror h3 {
          color: #eb5454;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          margin: 14px 0 8px 0;
        }
        #page-sheet-${pageIndex} .ProseMirror p {
          margin: 0 0 8px 0;
          font-size: 12.5px;
          line-height: 1.6;
          color: #111827;
        }
        #page-sheet-${pageIndex} .ProseMirror ul, #page-sheet-${pageIndex} .ProseMirror ol {
          margin: 8px 0 16px 24px;
          padding: 0;
          font-size: 12.5px;
          line-height: 1.6;
        }
        #page-sheet-${pageIndex} .ProseMirror li {
          margin-bottom: 4px;
        }
        #page-sheet-${pageIndex} .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 12px auto;
          display: block;
        }
      `}</style>
      <EditorContent editor={editor} />

      {/* Pie de Página Fijo en la Hoja A4 */}
      <div className="absolute bottom-6 left-14 right-14 border-t border-zinc-200 pt-2 text-[10px] text-zinc-500 flex items-center justify-between select-none pointer-events-none">
        <span>Un producto de Mr. Soft</span>
        <span className="font-semibold">
          Página {pageIndex + 1} de {totalPages}
        </span>
      </div>
    </div>
  );
};
