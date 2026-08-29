import React, { useEffect, useRef } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageSheetItemProps {
  pageIndex: number;
  totalPages: number;
  content: string;
  isActive: boolean;
  onFocus: () => void;
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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isUpdatingFromParent = useRef(false);

  // Synchronize incoming content from parent (e.g. on file upload or reset)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      isUpdatingFromParent.current = true;
      contentRef.current.innerHTML = content || "<p></p>";
      isUpdatingFromParent.current = false;
    }
  }, [content]);

  const handleInput = () => {
    if (isUpdatingFromParent.current) return;
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div
      id={`page-sheet-${pageIndex}`}
      className={`w-full max-w-[800px] min-h-[1080px] bg-white text-zinc-900 rounded-sm shadow-2xl relative mb-10 transition-all group ${
        isActive ? "ring-2 ring-primary/70" : "hover:shadow-3xl"
      }`}
      style={{
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.2)",
        padding: "50px 60px 75px 60px",
        boxSizing: "border-box",
      }}
      onClick={onFocus}
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

      {/* Editable Document Body (Preserves 100% of Word formatting, fonts, colors, tables and images) */}
      <style>{`
        #page-sheet-${pageIndex} .word-page-editable {
          outline: none;
          min-height: 920px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #111827;
        }
        #page-sheet-${pageIndex} .word-page-editable table {
          border-collapse: collapse;
          width: 100%;
          margin: 14px 0;
        }
        #page-sheet-${pageIndex} .word-page-editable td, 
        #page-sheet-${pageIndex} .word-page-editable th {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          vertical-align: middle;
          font-size: 12px;
        }
        #page-sheet-${pageIndex} .word-page-editable th {
          font-weight: bold;
          text-align: center;
          background-color: #eb5454;
          color: #ffffff;
        }
        #page-sheet-${pageIndex} .word-page-editable a {
          color: #eb5454;
          text-decoration: underline;
        }
        #page-sheet-${pageIndex} .word-page-editable h1,
        #page-sheet-${pageIndex} .word-page-editable h2,
        #page-sheet-${pageIndex} .word-page-editable h3 {
          color: #eb5454;
          font-weight: 700;
        }
        #page-sheet-${pageIndex} .word-page-editable img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 10px auto;
          display: block;
        }
        #page-sheet-${pageIndex} .word-page-editable ul,
        #page-sheet-${pageIndex} .word-page-editable ol {
          margin: 8px 0 16px 24px;
          padding: 0;
          font-size: 12.5px;
          line-height: 1.6;
        }
      `}</style>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={onFocus}
        onInput={handleInput}
        className="word-page-editable"
      />

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
