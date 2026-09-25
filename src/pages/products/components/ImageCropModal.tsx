import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Crop,
  Maximize2,
  RefreshCw,
  RotateCw,
  Sliders,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onApplyCrop: (croppedDataUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  open,
  onOpenChange,
  imageSrc,
  onApplyCrop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Crop offsets in percentages (0 to 40%)
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);

  // Rotation in degrees (0, 90, 180, 270)
  const [rotation, setRotation] = useState(0);

  // Aspect ratio preset
  const [aspectPreset, setAspectPreset] = useState<"free" | "1:1" | "16:9" | "4:3">("free");

  // Load image when modal opens
  useEffect(() => {
    if (open && imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgRef.current = img;
        resetCrop();
      };
      img.src = imageSrc;
    }
  }, [open, imageSrc]);

  // Redraw canvas whenever crop state changes
  useEffect(() => {
    if (open && imgRef.current) {
      drawPreview();
    }
  }, [cropTop, cropBottom, cropLeft, cropRight, rotation, open]);

  const resetCrop = () => {
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
    setRotation(0);
    setAspectPreset("free");
  };

  const applyAspectPreset = (preset: "free" | "1:1" | "16:9" | "4:3") => {
    setAspectPreset(preset);
    if (preset === "free") {
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    let targetRatio = 1;

    if (preset === "1:1") targetRatio = 1;
    if (preset === "16:9") targetRatio = 16 / 9;
    if (preset === "4:3") targetRatio = 4 / 3;

    const currentRatio = w / h;

    if (currentRatio > targetRatio) {
      // Image is wider -> crop horizontal sides
      const desiredW = h * targetRatio;
      const cropWPercent = ((w - desiredW) / w) * 100 / 2;
      setCropLeft(Math.round(cropWPercent));
      setCropRight(Math.round(cropWPercent));
      setCropTop(0);
      setCropBottom(0);
    } else {
      // Image is taller -> crop vertical sides
      const desiredH = w / targetRatio;
      const cropHPercent = ((h - desiredH) / h) * 100 / 2;
      setCropTop(Math.round(cropHPercent));
      setCropBottom(Math.round(cropHPercent));
      setCropLeft(0);
      setCropRight(0);
    }
  };

  const drawPreview = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    // Calculate source crop box in pixels
    const srcX = Math.round((cropLeft / 100) * origW);
    const srcY = Math.round((cropTop / 100) * origH);
    const srcW = Math.max(10, Math.round(origW - srcX - (cropRight / 100) * origW));
    const srcH = Math.max(10, Math.round(origH - srcY - (cropBottom / 100) * origH));

    // Handle rotation dimensions
    const isRotated90 = rotation === 90 || rotation === 270;
    const destW = isRotated90 ? srcH : srcW;
    const destH = isRotated90 ? srcW : srcH;

    canvas.width = destW;
    canvas.height = destH;

    ctx.clearRect(0, 0, destW, destH);
    ctx.save();

    // Rotate context around canvas center
    ctx.translate(destW / 2, destH / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw cropped portion onto canvas
    const drawW = isRotated90 ? destH : destW;
    const drawH = isRotated90 ? destW : destH;

    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcW,
      srcH,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );

    ctx.restore();
  };

  const handleSaveCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedDataUrl = canvas.toDataURL("image/png");
    onApplyCrop(croppedDataUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-4xl max-h-[92vh] p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-zinc-950 text-white flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Recortar Imagen
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Ajusta los recortes de bordes, rotación y proporciones de la imagen.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] overflow-hidden">
          {/* Main Visual Crop Preview Area */}
          <div className="relative p-6 flex items-center justify-center bg-zinc-950/90 overflow-auto min-h-[350px]">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl border border-zinc-800 bg-checkerboard"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            />
          </div>

          {/* Controls Sidebar */}
          <div className="p-5 border-l border-zinc-800 bg-zinc-900/80 space-y-5 overflow-y-auto">
            {/* Aspect Ratio Presets */}
            <div>
              <Label className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Proporción de Recorte</span>
              </Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["free", "1:1", "16:9", "4:3"] as const).map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={aspectPreset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyAspectPreset(preset)}
                    className={`h-8 text-[11px] font-bold ${
                      aspectPreset === preset
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {preset === "free" ? "Libre" : preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recortes en Porcentajes */}
            <div className="space-y-3 pt-1 border-t border-zinc-800">
              <Label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Recortar Bordes (%)</span>
              </Label>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Arriba</span>
                    <span className="font-mono text-amber-400">{cropTop}%</span>
                  </div>
                  <Slider
                    value={[cropTop]}
                    max={45}
                    step={1}
                    onValueChange={([val]) => setCropTop(val)}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Abajo</span>
                    <span className="font-mono text-amber-400">{cropBottom}%</span>
                  </div>
                  <Slider
                    value={[cropBottom]}
                    max={45}
                    step={1}
                    onValueChange={([val]) => setCropBottom(val)}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Izquierda</span>
                    <span className="font-mono text-amber-400">{cropLeft}%</span>
                  </div>
                  <Slider
                    value={[cropLeft]}
                    max={45}
                    step={1}
                    onValueChange={([val]) => setCropLeft(val)}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Derecha</span>
                    <span className="font-mono text-amber-400">{cropRight}%</span>
                  </div>
                  <Slider
                    value={[cropRight]}
                    max={45}
                    step={1}
                    onValueChange={([val]) => setCropRight(val)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Rotación</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="h-8 text-xs border-zinc-700 text-zinc-200 hover:bg-zinc-800 gap-1.5"
              >
                <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
                <span>Girar 90° ({rotation}°)</span>
              </Button>
            </div>

            {/* Reset */}
            <div className="pt-2 border-t border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetCrop}
                className="w-full h-8 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Restablecer Ajustes</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900 flex flex-row items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveCrop}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1.5 px-5"
          >
            <Check className="h-4 w-4" />
            <span>Aplicar Recorte</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
