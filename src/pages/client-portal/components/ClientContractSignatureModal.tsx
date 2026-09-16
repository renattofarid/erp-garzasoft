import React, { useEffect, useRef, useState } from "react";
import {
  PenTool,
  Upload,
  RotateCcw,
  Check,
  FileCheck,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContractResource } from "@/pages/contract/lib/contract.interface";
import { signContractByClient } from "@/pages/contract/lib/contract.actions";
import { errorToast, successToast } from "@/lib/core.function";

interface ClientContractSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractResource | null;
  onSuccess: () => void;
}

export function ClientContractSignatureModal({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: ClientContractSignatureModalProps) {
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (open && contract) {
      setSignatureData(contract.firma_cliente || null);
      setIsEmpty(!contract.firma_cliente);
    }
  }, [open, contract]);

  useEffect(() => {
    if (!open || signatureMode !== "draw") return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = (rect.width || 500) * dpr;
      canvas.height = 220 * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;

      if (signatureData) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, rect.width || 500, 220);
          ctx.drawImage(img, 0, 0, rect.width || 500, 220);
          setIsEmpty(false);
        };
        img.src = signatureData;
      } else {
        ctx.clearRect(0, 0, rect.width || 500, 220);
        setIsEmpty(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open, signatureMode, signatureData]);

  if (!contract) return null;

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setIsEmpty(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
      const dataUrl = canvas.toDataURL("image/png");
      setSignatureData(dataUrl);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent?.getBoundingClientRect().width || 500;
    ctx.clearRect(0, 0, width, 220);
    setIsEmpty(true);
    setSignatureData(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      errorToast("Seleccione una imagen válida (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignatureData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSignature = async () => {
    if (!signatureData) {
      errorToast("Por favor dibuje o cargue su firma antes de guardar.");
      return;
    }

    try {
      setSubmitting(true);
      await signContractByClient(contract.id, signatureData);
      successToast("¡Contrato firmado correctamente!");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "No se pudo registrar la firma.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-6 gap-4">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Firma Digital de Contrato</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Contrato <strong className="text-foreground">{contract.numero}</strong> • {contract.cliente?.razon_social || contract.cliente?.nombre_comercial}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/50 p-2.5 rounded-xl border border-border/60 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Conformidad Digital</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant={signatureMode === "draw" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs font-semibold"
                onClick={() => setSignatureMode("draw")}
              >
                <PenTool className="h-3.5 w-3.5 mr-1" /> Dibujar
              </Button>
              <Button
                variant={signatureMode === "upload" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs font-semibold"
                onClick={() => setSignatureMode("upload")}
              >
                <Upload className="h-3.5 w-3.5 mr-1" /> Imagen
              </Button>
            </div>
          </div>

          {signatureMode === "draw" ? (
            <div className="space-y-2">
              <div className="relative w-full border-2 border-dashed border-border rounded-xl bg-card overflow-hidden min-h-[220px] flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full h-[220px] cursor-crosshair touch-none select-none"
                  style={{ touchAction: "none" }}
                />
                {isEmpty && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground gap-1.5">
                    <PenTool className="h-7 w-7 opacity-40 animate-pulse" />
                    <span className="text-xs font-medium">Dibuje su firma aquí con el mouse o pantalla táctil</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Firma en trazo libre digital</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="h-7 gap-1 text-xs text-rose-600 dark:text-rose-400 border-border"
                >
                  <RotateCcw className="h-3 w-3" /> Limpiar trazo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {signatureData ? (
                <div className="relative border border-border rounded-xl p-4 bg-muted/40 flex flex-col items-center justify-center min-h-[200px]">
                  <img
                    src={signatureData}
                    alt="Firma cliente"
                    className="max-h-[150px] object-contain rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setSignatureData(null)}
                    className="mt-3 h-8 gap-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Quitar Firma
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-muted/30 min-h-[200px] flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-9 w-9 text-muted-foreground mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Haz clic o arrastra tu archivo de firma
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Formatos recomendados: PNG o JPG transparente o fondo claro
                  </p>
                </label>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSignature}
            disabled={submitting || (!signatureData && isEmpty)}
            className="gap-1.5 font-bold"
          >
            <Check className="h-4 w-4" />
            {submitting ? "Registrando..." : "Confirmar y Firmar Contrato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
