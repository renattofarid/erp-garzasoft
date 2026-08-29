import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  Copy,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
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
  const imageReplaceInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgToolbarPos, setImgToolbarPos] = useState<{ top: number; left: number } | null>(null);

  // Synchronize incoming content from parent
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      isUpdatingFromParent.current = true;
      contentRef.current.innerHTML = content || "<p></p>";
      isUpdatingFromParent.current = false;
      attachImageHandlers();
    }
  }, [content]);

  // Attach Drag & Drop + Click listeners to all images in this sheet
  const attachImageHandlers = () => {
    if (!contentRef.current) return;
    const imgs = contentRef.current.querySelectorAll("img");

    imgs.forEach((img) => {
      img.setAttribute("draggable", "true");
      img.style.cursor = "grab";

      img.onclick = (e) => {
        e.stopPropagation();
        setSelectedImg(img);
        updateToolbarPos(img);
      };

      img.ondragstart = (e) => {
        e.dataTransfer?.setData("text/plain", img.src);
        (window as any).__draggedDocxImg = img;
        img.style.opacity = "0.5";
      };

      img.ondragend = () => {
        img.style.opacity = "1";
        (window as any).__draggedDocxImg = null;
      };

      img.ondragover = (e) => {
        e.preventDefault();
        img.style.outline = "3px dashed #eb5454";
        img.style.outlineOffset = "4px";
      };

      img.ondragleave = () => {
        img.style.outline = "";
        img.style.outlineOffset = "";
      };

      img.ondrop = (e) => {
        e.preventDefault();
        img.style.outline = "";
        img.style.outlineOffset = "";

        const sourceImg = (window as any).__draggedDocxImg as HTMLImageElement | null;
        if (sourceImg && sourceImg !== img) {
          // SWAP IMAGES
          const tempSrc = img.src;
          const tempAlt = img.alt;
          const tempStyle = img.getAttribute("style") || "";

          img.src = sourceImg.src;
          img.alt = sourceImg.alt;
          if (sourceImg.getAttribute("style")) {
            img.setAttribute("style", sourceImg.getAttribute("style") || "");
          }

          sourceImg.src = tempSrc;
          sourceImg.alt = tempAlt;
          if (tempStyle) {
            sourceImg.setAttribute("style", tempStyle);
          }

          handleInput();
        }
      };
    });
  };

  const updateToolbarPos = (img: HTMLImageElement) => {
    const sheetEl = document.getElementById(`page-sheet-${pageIndex}`);
    if (!sheetEl) return;
    const sheetRect = sheetEl.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    setImgToolbarPos({
      top: imgRect.top - sheetRect.top - 42,
      left: Math.max(10, imgRect.left - sheetRect.left + imgRect.width / 2 - 140),
    });
  };

  const handleInput = () => {
    if (isUpdatingFromParent.current) return;
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
      attachImageHandlers();
    }
  };

  // Image actions
  const handleAlign = (alignment: "left" | "center" | "right") => {
    if (!selectedImg) return;
    if (alignment === "left") {
      selectedImg.style.margin = "10px 16px 10px 0";
      selectedImg.style.float = "left";
      selectedImg.style.display = "inline-block";
    } else if (alignment === "right") {
      selectedImg.style.margin = "10px 0 10px 16px";
      selectedImg.style.float = "right";
      selectedImg.style.display = "inline-block";
    } else {
      selectedImg.style.margin = "12px auto";
      selectedImg.style.float = "none";
      selectedImg.style.display = "block";
    }
    handleInput();
    updateToolbarPos(selectedImg);
  };

  const handleResize = (multiplier: number) => {
    if (!selectedImg) return;
    const currentWidth = selectedImg.clientWidth || 200;
    const newWidth = Math.max(60, Math.min(700, Math.round(currentWidth * multiplier)));
    selectedImg.style.width = `${newWidth}px`;
    selectedImg.style.maxWidth = "100%";
    selectedImg.style.height = "auto";
    handleInput();
    updateToolbarPos(selectedImg);
  };

  const handleDeleteImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    setImgToolbarPos(null);
    handleInput();
  };

  const handleReplaceImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImg) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && selectedImg) {
        selectedImg.src = reader.result;
        handleInput();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
      onClick={() => {
        onFocus();
        setSelectedImg(null);
        setImgToolbarPos(null);
      }}
    >
      <input
        type="file"
        ref={imageReplaceInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleReplaceImageFile}
      />

      {/* Floating Image Action Toolbar */}
      {selectedImg && imgToolbarPos && (
        <div
          className="absolute bg-zinc-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl px-2 py-1 flex items-center gap-1 z-30 border border-zinc-700 animate-in fade-in zoom-in-95 select-none"
          style={{ top: `${imgToolbarPos.top}px`, left: `${imgToolbarPos.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold text-amber-400 px-1 flex items-center gap-1">
            <ArrowLeftRight className="h-3 w-3" /> Arrastra p/ Intercambiar
          </span>
          <div className="h-3.5 w-px bg-zinc-700 mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleAlign("left")}
            title="Alinear a la izquierda"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleAlign("center")}
            title="Centrar"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleAlign("right")}
            title="Alinear a la derecha"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <div className="h-3.5 w-px bg-zinc-700 mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleResize(0.85)}
            title="Reducir tamaño"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleResize(1.15)}
            title="Aumentar tamaño"
            className="h-6 w-6 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <div className="h-3.5 w-px bg-zinc-700 mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => imageReplaceInputRef.current?.click()}
            title="Reemplazar por otra imagen"
            className="h-6 w-6 text-cyan-400 hover:text-cyan-300 hover:bg-zinc-800"
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDeleteImage}
            title="Eliminar imagen"
            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-zinc-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={totalPages > 1 ? "Eliminar esta página" : "Vaciar esta página"}
          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Editable Document Body */}
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
          transition: outline 0.15s ease, transform 0.15s ease;
        }
        #page-sheet-${pageIndex} .word-page-editable img:hover {
          outline: 2px solid #eb5454;
          outline-offset: 2px;
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
        className="word-page-editable focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      />

      {/* Institutional Printable Footer */}
      <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/80 pt-2 select-none pointer-events-none">
        <span>Un producto de Mr. Soft</span>
        <span>
          Página {pageIndex + 1} de {totalPages}
        </span>
      </div>
    </div>
  );
};
