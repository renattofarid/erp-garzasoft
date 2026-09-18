import React, { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building2,
  Hash,
  Calendar,
  DollarSign,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CuentasPorCobrarResource } from "../lib/accounts-receivable.interface";
import { api } from "@/lib/config";
import { errorToast, successToast } from "@/lib/core.function";
import { format } from "date-fns";

interface GenerateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cuota: CuentasPorCobrarResource | null;
  onSuccess: () => void;
}

interface CorrelativoData {
  serie: string;
  ultimo_correlativo: number;
  siguiente_correlativo: number;
  facturador?: {
    id?: number;
    modo?: string;
    ruc?: string;
    razon_social?: string;
  };
}

/** Helper para extraer datos de facturas PDF comunes (Garzasoft / SUNAT) */
export function extractInvoiceDataFromPdfText(text: string) {
  let serie = "F001";
  let correlativo = "";
  let fechaEmision = "";
  let total = "";

  // 1. Serie y Correlativo: e.g. F001-00015440 o F001-15440
  const serieMatch = text.match(/([FB]\d{3})[-_\s:]+(\d{1,8})/i);
  if (serieMatch) {
    serie = serieMatch[1].toUpperCase();
    correlativo = String(parseInt(serieMatch[2], 10));
  }

  // 2. Fecha Emisión: e.g. 31/08/2026 o 2026-08-31
  const fechaMatch = text.match(/(?:Fecha\s*Emisi[oó]n|Emisi[oó]n)[:\s]*(\d{2}[\/-]\d{2}[\/-]\d{4})/i);
  if (fechaMatch) {
    const parts = fechaMatch[1].split(/[\/-]/);
    if (parts.length === 3) {
      fechaEmision = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  // 3. Importe Total: e.g. Importe Total S/ 240.00
  const totalMatch = text.match(/(?:Importe\s*Total|Total)[:\s]*(?:S\/|PEN|\$)?\s*([\d,.]+)/i);
  if (totalMatch) {
    const val = totalMatch[1].replace(/,/g, "");
    if (!isNaN(parseFloat(val))) {
      total = parseFloat(val).toFixed(2);
    }
  }

  return { serie, correlativo, fechaEmision, total };
}

export function GenerateInvoiceModal({
  open,
  onOpenChange,
  cuota,
  onSuccess,
}: GenerateInvoiceModalProps) {
  const [activeMode, setActiveMode] = useState<"sistema" | "manual">("sistema");
  const [loadingCorrelativo, setLoadingCorrelativo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Datos Correlativo Facturador
  const [correlativoInfo, setCorrelativoInfo] = useState<CorrelativoData | null>(null);

  // Formulario Modo Sistema
  const [sistemaSerie, setSistemaSerie] = useState("F001");
  const [sistemaCorrelativo, setSistemaCorrelativo] = useState("");
  const [sistemaFechaEmision, setSistemaFechaEmision] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // Formulario Modo Manual (PDF)
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [manualSerie, setManualSerie] = useState("F001");
  const [manualCorrelativo, setManualCorrelativo] = useState("");
  const [manualFechaEmision, setManualFechaEmision] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [manualMontoTotal, setManualMontoTotal] = useState("");

  // Cargar información del correlativo al abrir el modal
  useEffect(() => {
    if (open && cuota) {
      setSistemaFechaEmision(format(new Date(), "yyyy-MM-dd"));
      setManualFechaEmision(format(new Date(), "yyyy-MM-dd"));
      setManualMontoTotal(Number(cuota.monto_pendiente || cuota.monto_total || 0).toFixed(2));
      setPdfFile(null);

      fetchSiguienteCorrelativo("F001");
    }
  }, [open, cuota]);

  const fetchSiguienteCorrelativo = async (serie: string) => {
    try {
      setLoadingCorrelativo(true);
      const res = await api.get("cuotas/siguiente-correlativo", {
        params: { tipo_documento: "F", serie },
      });

      const info: CorrelativoData = res.data?.data;
      setCorrelativoInfo(info);
      setSistemaSerie(info.serie || "F001");
      setSistemaCorrelativo(String(info.siguiente_correlativo || 1));
    } catch {
      setSistemaCorrelativo("1");
    } finally {
      setLoadingCorrelativo(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      errorToast("Seleccione un archivo en formato PDF.");
      return;
    }

    setPdfFile(file);

    // Intentar extraer texto mediante FileReader
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const extracted = extractInvoiceDataFromPdfText(text);

      if (extracted.serie) setManualSerie(extracted.serie);
      if (extracted.correlativo) setManualCorrelativo(extracted.correlativo);
      if (extracted.fechaEmision) setManualFechaEmision(extracted.fechaEmision);
      if (extracted.total) setManualMontoTotal(extracted.total);

      successToast("Datos de la factura PDF extraídos para su revisión.");
    };
    reader.readAsText(file, "latin1");
  };

  const handleSubmitSistema = async () => {
    if (!cuota) return;

    try {
      setSubmitting(true);
      const payload = {
        modo: "sistema",
        serie: sistemaSerie,
        correlativo: sistemaCorrelativo ? parseInt(sistemaCorrelativo, 10) : undefined,
        fecha_emision: sistemaFechaEmision,
      };

      const res = await api.post(`cuotas/${cuota.id}/generar-factura`, payload);
      successToast(res.data?.message || "Factura generada exitosamente en el facturador.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "No se pudo generar la factura.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitManual = async () => {
    if (!cuota) return;

    if (!manualSerie || !manualCorrelativo) {
      errorToast("Ingrese la serie y el correlativo de la factura.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("modo", "manual");
      formData.append("serie", manualSerie.toUpperCase());
      formData.append("correlativo", manualCorrelativo);
      formData.append("fecha_emision", manualFechaEmision);
      formData.append("monto_total", manualMontoTotal);

      if (pdfFile) {
        formData.append("pdf_file", pdfFile);
      }

      const res = await api.post(`cuotas/${cuota.id}/generar-factura`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      successToast(res.data?.message || "Factura manual cargada y vinculada.");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "No se pudo vincular la factura manual.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cuota) return null;

  const cliente = cuota.contrato?.cliente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-6 gap-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Emisión de Factura Electrónica
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Contrato <strong className="text-foreground">{cuota.contrato?.numero}</strong> • {cliente?.razon_social || cliente?.nombre_comercial} • Monto S/. {Number(cuota.monto_pendiente || cuota.monto_total || 0).toFixed(2)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-11 p-1 bg-muted/70">
            <TabsTrigger value="sistema" className="text-xs font-bold gap-2">
              <Send className="h-4 w-4 text-amber-500" />
              <span>Generar con Facturador (Sistema)</span>
            </TabsTrigger>

            <TabsTrigger value="manual" className="text-xs font-bold gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span>Subir PDF Manual</span>
            </TabsTrigger>
          </TabsList>

          {/* MODO 1: GENERAR CON FACTURADOR AUTOMÁTICO DE GARZASOFT */}
          <TabsContent value="sistema" className="space-y-4 pt-4 outline-none">
            <div className="rounded-xl bg-muted/40 p-3.5 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Emisor Activo:</span>
                  <span className="font-bold">{correlativoInfo?.facturador?.razon_social || "Garzasoft Facturador"}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    correlativoInfo?.facturador?.modo === "produccion"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] uppercase font-bold"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold"
                  }
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Modo: {correlativoInfo?.facturador?.modo || "Producción"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground">Último Correlativo Emitido:</span>
                  <strong className="font-mono text-foreground">
                    {loadingCorrelativo ? "Cargando..." : (correlativoInfo?.ultimo_correlativo || 0)}
                  </strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-background border border-border/50">
                  <span className="text-muted-foreground">Siguiente Correlativo:</span>
                  <strong className="font-mono text-emerald-600 font-bold">
                    {loadingCorrelativo ? "Cargando..." : (correlativoInfo?.siguiente_correlativo || 1)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Serie
                </Label>
                <Input
                  value={sistemaSerie}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setSistemaSerie(val);
                    fetchSiguienteCorrelativo(val);
                  }}
                  className="h-9 font-mono text-xs uppercase"
                  placeholder="F001"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Correlativo a Generar
                </Label>
                <Input
                  type="number"
                  value={sistemaCorrelativo}
                  onChange={(e) => setSistemaCorrelativo(e.target.value)}
                  className="h-9 font-mono text-xs font-bold text-emerald-600"
                  placeholder="15440"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Fecha Emisión
                </Label>
                <Input
                  type="date"
                  value={sistemaFechaEmision}
                  onChange={(e) => setSistemaFechaEmision(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitSistema}
                disabled={submitting || loadingCorrelativo}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Emitiendo a SUNAT...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Generar y Emitir Factura
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* MODO 2: SUBIR FACTURA MANUALMENTE (PDF) CON LECTURA AUTOMÁTICA */}
          <TabsContent value="manual" className="space-y-4 pt-4 outline-none">
            <div className="space-y-2">
              <label className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20 flex flex-col items-center justify-center min-h-[120px]">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfChange}
                />
                <Upload className="h-7 w-7 text-muted-foreground mb-1.5" />
                <p className="text-xs font-bold text-foreground">
                  {pdfFile ? pdfFile.name : "Haz clic o arrastra tu archivo PDF de la Factura"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {pdfFile ? `PDF seleccionado (${(pdfFile.size / 1024).toFixed(1)} KB) - Datos leídos automáticamente` : "Formato soportado: PDF oficial (SUNAT / Garzasoft)"}
                </p>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Serie Factura</Label>
                <Input
                  value={manualSerie}
                  onChange={(e) => setManualSerie(e.target.value.toUpperCase())}
                  className="h-9 font-mono text-xs uppercase"
                  placeholder="F001"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Correlativo</Label>
                <Input
                  type="number"
                  value={manualCorrelativo}
                  onChange={(e) => setManualCorrelativo(e.target.value)}
                  className="h-9 font-mono text-xs font-bold text-foreground"
                  placeholder="15440"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Fecha Emisión</Label>
                <Input
                  type="date"
                  value={manualFechaEmision}
                  onChange={(e) => setManualFechaEmision(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monto Total S/.</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualMontoTotal}
                  onChange={(e) => setManualMontoTotal(e.target.value)}
                  className="h-9 font-mono text-xs font-bold"
                  placeholder="240.00"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitManual}
                disabled={submitting}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" /> Vincular Factura Manual
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
