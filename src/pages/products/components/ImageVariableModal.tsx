import React, { useState } from "react";
import {
  Braces,
  Check,
  CheckCircle2,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeVariableKey } from "../lib/docVariables";

interface ImageVariableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImageSrc: string;
  existingVariableKey?: string;
  existingOptions?: string[];
  selectedIndex?: number;
  onSave: (variableKey: string, options: string[], activeIndex: number) => void;
}

export const ImageVariableModal: React.FC<ImageVariableModalProps> = ({
  open,
  onOpenChange,
  currentImageSrc,
  existingVariableKey = "",
  existingOptions = [],
  selectedIndex = 0,
  onSave,
}) => {
  const [variableKey, setVariableKey] = useState(existingVariableKey || "LOGO_SELECCIONABLE");
  const [options, setOptions] = useState<string[]>(
    existingOptions.length > 0 ? existingOptions : [currentImageSrc]
  );
  const [activeIdx, setActiveIdx] = useState<number>(selectedIndex || 0);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setVariableKey(existingVariableKey || "LOGO_SELECCIONABLE");
      setOptions(existingOptions.length > 0 ? existingOptions : [currentImageSrc]);
      setActiveIdx(selectedIndex || 0);
    }
  }, [open, currentImageSrc, existingVariableKey, existingOptions, selectedIndex]);

  const handleAddOptionFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setOptions((prev) => [...prev, reader.result as string]);
        setActiveIdx(options.length); // select new option
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    setActiveIdx(Math.min(activeIdx, updated.length - 1));
  };

  const handleSave = () => {
    const cleanKey = normalizeVariableKey(variableKey || "LOGO_VARIABLE");
    onSave(cleanKey, options, activeIdx);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-2xl max-h-[92vh] p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-card text-card-foreground flex flex-col sm:max-w-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                Variable de Elección de Imagen
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Define esta ubicación como una variable de elección entre múltiples imágenes (ej: Logo A vs Logo B).
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Variable Key Input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold flex items-center gap-1.5">
              <span>Nombre de la Variable</span>
              <span className="text-purple-500 font-mono text-[11px]">{"{..."}</span>
            </Label>
            <Input
              value={variableKey}
              onChange={(e) => setVariableKey(normalizeVariableKey(e.target.value))}
              placeholder="Ej: LOGO_CABECERA, IMAGEN_PLAN, FIRMA_VALIDANTE"
              className="font-mono text-xs font-bold uppercase tracking-wide bg-background"
            />
            <p className="text-[11px] text-muted-foreground">
              Esta clave se usará para seleccionar la imagen adecuada al generar contratos o formatos de alta.
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-purple-500" />
                <span>Opciones de Imágenes Disponibles ({options.length})</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar Otra Imagen</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAddOptionFile}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.map((optSrc, idx) => {
                const isSelected = activeIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`relative group rounded-xl border-2 p-2 transition-all cursor-pointer flex flex-col items-center justify-between ${
                      isSelected
                        ? "border-purple-600 bg-purple-500/10 shadow-md ring-2 ring-purple-500/30"
                        : "border-border hover:border-purple-300 hover:bg-accent/50"
                    }`}
                  >
                    <div className="w-full h-24 flex items-center justify-center bg-zinc-950/5 rounded-lg overflow-hidden mb-2 relative">
                      <img
                        src={optSrc}
                        alt={`Opción ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5 shadow">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${isSelected ? "text-purple-600 dark:text-purple-400 font-bold" : "text-muted-foreground"}`}>
                        Opción {idx + 1} {isSelected ? "(Activa)" : ""}
                      </span>
                      {options.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOption(idx);
                          }}
                          className="h-5 w-5 text-red-400 hover:text-red-600 hover:bg-red-50"
                          title="Eliminar esta opción"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 px-5 shadow-sm"
          >
            <Check className="h-4 w-4" />
            <span>Guardar Variable de Elección</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
