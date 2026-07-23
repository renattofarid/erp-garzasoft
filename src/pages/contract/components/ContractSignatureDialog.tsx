import React, { useEffect, useRef, useState } from "react";
import {
  PenTool,
  Upload,
  RotateCcw,
  Check,
  Building2,
  User,
  Sparkles,
  Trash2,
  FileCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ContractResource } from "../lib/contract.interface";
import {
  getFacturadorActivo,
  saveContractSignatures,
} from "../lib/contract.actions";
import { errorToast, successToast } from "@/lib/core.function";

interface ContractSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractResource | null;
  onSuccess?: () => void;
}

/**
 * Componente Lienzo interactivo para Firma con Mouse o Táctil (Pantalla Celular / Tablet)
 */
function SignaturePad({
  value,
  onChange,
  penColor = "#0f172a",
  penWidth = 3,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  penColor?: string;
  penWidth?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Inicializar o redimensionar canvas con escalado High-DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = (rect.width || 500) * dpr;
    canvas.height = 200 * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Si ya existe un valor de imagen cargado, dibujarlo en el canvas
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width || 500, 200);
        ctx.drawImage(img, 0, 0, rect.width || 500, 200);
        setIsEmpty(false);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, rect.width || 500, 200);
      setIsEmpty(true);
    }
  }, [value]);

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

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

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
      onChange(dataUrl);
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
    ctx.clearRect(0, 0, width, 200);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 overflow-hidden shadow-inner min-h-[200px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[200px] cursor-crosshair touch-none select-none"
          style={{ touchAction: "none" }}
        />
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1">
            <PenTool className="w-8 h-8 opacity-40 animate-pulse" />
            <span className="text-xs font-medium">
              Firme aquí con el cursor o el dedo
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500">
          Trazo táctil fluido de alta precisión
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpiar trazo
        </Button>
      </div>
    </div>
  );
}

/**
 * Componente para cargar imagen de firma
 */
function ImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      errorToast("Por favor seleccione un archivo de imagen válido (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center min-h-[200px]">
          <img
            src={value}
            alt="Firma subida"
            className="max-h-[160px] object-contain rounded"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onChange(null)}
            className="mt-3 h-8 gap-1 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Quitar Imagen
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-slate-50/50 dark:bg-slate-900/30 min-h-[200px] flex flex-col items-center justify-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Haz clic o arrastra una imagen de firma aquí
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Formatos recomendados: PNG o JPG con fondo claro o transparente
          </p>
        </div>
      )}
    </div>
  );
}

export function ContractSignatureDialog({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: ContractSignatureDialogProps) {
  const [activeTab, setActiveTab] = useState<"arrendador" | "cliente">("arrendador");
  const [arrendadorMode, setArrendadorMode] = useState<"draw" | "upload">("draw");
  const [clienteMode, setClienteMode] = useState<"draw" | "upload">("draw");

  const [firmaArrendador, setFirmaArrendador] = useState<string | null>(null);
  const [firmaCliente, setFirmaCliente] = useState<string | null>(null);
  const [defaultArrendadorFirma, setDefaultArrendadorFirma] = useState<string | null>(null);
  const [saveAsDefaultArrendador, setSaveAsDefaultArrendador] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingDefault, setFetchingDefault] = useState(false);

  // Inicializar firmas cuando se abre el diálogo con un contrato
  useEffect(() => {
    if (open && contract) {
      setFirmaArrendador(contract.firma_arrendador || null);
      setFirmaCliente(contract.firma_cliente || null);
      setSaveAsDefaultArrendador(false);

      // Cargar firma por defecto del emisor si no tiene firma individual
      setFetchingDefault(true);
      getFacturadorActivo()
        .then((facturador) => {
          if (facturador?.firma_arrendador_default) {
            setDefaultArrendadorFirma(facturador.firma_arrendador_default);
            if (!contract.firma_arrendador) {
              setFirmaArrendador(facturador.firma_arrendador_default);
            }
          }
        })
        .catch(() => {})
        .finally(() => setFetchingDefault(false));
    }
  }, [open, contract]);

  if (!contract) return null;

  const handleLoadDefaultArrendador = () => {
    if (defaultArrendadorFirma) {
      setFirmaArrendador(defaultArrendadorFirma);
      successToast("Firma por defecto del Arrendador cargada.");
    } else {
      errorToast("No hay una firma por defecto del Arrendador configurada.");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveContractSignatures(contract.id, {
        firma_arrendador: firmaArrendador,
        firma_cliente: firmaCliente,
        guardar_como_default_arrendador: saveAsDefaultArrendador,
      });

      successToast("Firmas del contrato guardadas correctamente.");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "No se pudieron guardar las firmas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full p-4 sm:p-6 gap-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Gestión de Firmas - Contrato {contract.numero}
              </DialogTitle>

              <DialogDescription className="text-xs text-slate-500">
                Registre o edite las firmas digitales del Arrendador y del Cliente ({contract.cliente?.razon_social || contract.cliente?.nombre_comercial || "Cliente"})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="arrendador" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span>Firma Arrendador</span>
              {firmaArrendador ? (
                <Badge variant="default" className="ml-1 text-[10px] px-1.5 bg-emerald-600">
                  <Check className="w-3 h-3 mr-0.5" /> Registrada
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-1 text-[10px] px-1.5 text-slate-400">
                  Pendiente
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="cliente" className="gap-2">
              <User className="w-4 h-4" />
              <span>Firma Cliente</span>
              {firmaCliente ? (
                <Badge variant="default" className="ml-1 text-[10px] px-1.5 bg-emerald-600">
                  <Check className="w-3 h-3 mr-0.5" /> Registrada
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-1 text-[10px] px-1.5 text-slate-400">
                  Pendiente
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB ARRENDADOR */}
          <TabsContent value="arrendador" className="space-y-4 m-0 focus-visible:ring-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Método de ingreso:
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={arrendadorMode === "draw" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setArrendadorMode("draw")}
                  >
                    <PenTool className="w-3.5 h-3.5" /> Dibujar
                  </Button>
                  <Button
                    type="button"
                    variant={arrendadorMode === "upload" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setArrendadorMode("upload")}
                  >
                    <Upload className="w-3.5 h-3.5" /> Subir Imagen
                  </Button>
                </div>
              </div>

              {defaultArrendadorFirma && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDefaultArrendador}
                  className="h-7 text-xs gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cargar firma por defecto
                </Button>
              )}
            </div>

            {arrendadorMode === "draw" ? (
              <SignaturePad
                value={firmaArrendador}
                onChange={setFirmaArrendador}
              />
            ) : (
              <ImageUploader
                value={firmaArrendador}
                onChange={setFirmaArrendador}
              />
            )}

            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox
                id="saveDefaultArrendador"
                checked={saveAsDefaultArrendador}
                onCheckedChange={(checked) => setSaveAsDefaultArrendador(Boolean(checked))}
              />
              <Label
                htmlFor="saveDefaultArrendador"
                className="text-xs font-normal text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Establecer esta firma como la firma global por defecto del Arrendador para futuros contratos.
              </Label>
            </div>
          </TabsContent>

          {/* TAB CLIENTE */}
          <TabsContent value="cliente" className="space-y-4 m-0 focus-visible:ring-0">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Método de ingreso:
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant={clienteMode === "draw" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setClienteMode("draw")}
                >
                  <PenTool className="w-3.5 h-3.5" /> Dibujar
                </Button>
                <Button
                  type="button"
                  variant={clienteMode === "upload" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setClienteMode("upload")}
                >
                  <Upload className="w-3.5 h-3.5" /> Subir Imagen
                </Button>
              </div>
            </div>

            {clienteMode === "draw" ? (
              <SignaturePad
                value={firmaCliente}
                onChange={setFirmaCliente}
              />
            ) : (
              <ImageUploader
                value={firmaCliente}
                onChange={setFirmaCliente}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="gap-2"
          >
            {loading ? "Guardando..." : "Guardar Firmas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
