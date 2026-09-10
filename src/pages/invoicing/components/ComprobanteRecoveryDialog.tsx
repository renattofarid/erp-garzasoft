import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { ZipIcon } from "@/components/icons/DocumentIcons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorToast, successToast } from "@/lib/core.function";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";
import { ClientEditRoute } from "@/pages/client/lib/client.interface";
import {
  actualizarComprobante,
  downloadComprobanteFile,
  emitirComprobante,
} from "../lib/invoicing.actions";
import type {
  ActualizarComprobantePayload,
  ComprobanteDetalle,
  ComprobanteResource,
  TipoDocumento,
} from "../lib/invoicing.interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprobante: ComprobanteResource | null;
  onSuccess: () => Promise<void> | void;
}

const editableStates = ["E", "X", "I", "V"];

export function ComprobanteRecoveryDialog({
  open,
  onOpenChange,
  comprobante,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<ActualizarComprobantePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!comprobante) return;
    setForm({
      cliente_id: comprobante.cliente_id,
      tipo_documento: comprobante.tipo_documento,
      serie: comprobante.serie,
      correlativo: comprobante.correlativo,
      moneda: comprobante.moneda,
      forma_pago: comprobante.forma_pago,
      fecha_emision: comprobante.fecha_emision,
      detalles: (comprobante.detalles || []).map((detalle) => ({
        ...detalle,
        cantidad: Number(detalle.cantidad),
        precio_unitario: Number(detalle.precio_unitario),
      })),
    });
    setShowTechnicalDetails(false);
  }, [comprobante]);

  const editable = Boolean(comprobante && editableStates.includes(comprobante.estado));
  const hasZip = Boolean(comprobante?.zip_path || (comprobante && ["M", "T"].includes(comprobante.estado)));
  const total = useMemo(
    () => form?.detalles.reduce(
      (sum, item) => sum + Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
      0
    ) || 0,
    [form]
  );

  const updateDetail = (index: number, values: Partial<ComprobanteDetalle>) => {
    setForm((current) => current ? ({
      ...current,
      detalles: current.detalles.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item
      ),
    }) : current);
  };

  const addDetail = () => {
    setForm((current) => current ? ({
      ...current,
      detalles: [...current.detalles, {
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        tipo_igv: "10",
        unidad: "NIU",
      }],
    }) : current);
  };

  const removeDetail = (index: number) => {
    setForm((current) => current && current.detalles.length > 1 ? ({
      ...current,
      detalles: current.detalles.filter((_, itemIndex) => itemIndex !== index),
    }) : current);
  };

  const errorMessage = (error: any) => {
    return error?.response?.data?.message
      || Object.values(error?.response?.data?.errors || {}).flat()?.[0]
      || "No se pudo procesar la factura.";
  };

  const save = async (resend: boolean) => {
    if (!comprobante || !form) return;
    if (form.detalles.some((item) => !item.descripcion.trim() || item.cantidad <= 0 || item.precio_unitario <= 0)) {
      errorToast("Completa la descripcion, cantidad y precio de todos los detalles.");
      return;
    }

    setSaving(true);
    try {
      await actualizarComprobante(comprobante.id, form);
      if (resend) {
        await emitirComprobante(comprobante.id);
        successToast("Factura corregida y aceptada por el facturador.");
      } else {
        successToast("Cambios guardados. La factura queda pendiente de reenvio.");
      }
      onOpenChange(false);
      await onSuccess();
    } catch (error: any) {
      errorToast(String(errorMessage(error)));
      await onSuccess();
    } finally {
      setSaving(false);
    }
  };

  const retryWithoutChanges = async () => {
    if (!comprobante) return;
    setSaving(true);
    try {
      await emitirComprobante(comprobante.id);
      successToast("Factura aceptada por el facturador.");
      onOpenChange(false);
      await onSuccess();
    } catch (error: any) {
      errorToast(String(errorMessage(error)));
      await onSuccess();
    } finally {
      setSaving(false);
    }
  };

  const downloadResponse = async (type: "cdr" | "zip") => {
    if (!comprobante) return;

    try {
      const blob = await downloadComprobanteFile(comprobante.id, type);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = type === "zip"
        ? `${comprobante.numero}-SUNAT.zip`
        : `${comprobante.numero}-respuesta.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      errorToast(type === "zip" ? "No se pudo descargar el ZIP devuelto por el facturador." : "No se pudo descargar la respuesta del facturador.");
    }
  };

  const handleCopyJson = (content: any) => {
    try {
      navigator.clipboard.writeText(
        typeof content === "string" ? content : JSON.stringify(content, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      successToast("Respuesta copiada al portapapeles.");
    } catch {
      errorToast("No se pudo copiar el JSON.");
    }
  };

  if (!comprobante || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="text-xl">Factura {comprobante.numero}</DialogTitle>
              <DialogDescription>
                {getClientDisplayName(comprobante.cliente)} · Los precios ingresados incluyen IGV.
              </DialogDescription>
            </div>
            {hasZip && (
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => downloadResponse("zip")}
              >
                <ZipIcon className="size-4" />
                Descargar ZIP SUNAT
              </Button>
            )}
          </div>
        </DialogHeader>

        {comprobante.error_text && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="size-4" />
                Error {comprobante.error_code ? `(${comprobante.error_code})` : "del facturador"}
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 bg-background/80"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                >
                  <FileCode className="size-3.5" />
                  {showTechnicalDetails ? "Ocultar respuesta técnica" : "Ver respuesta técnica"}
                  {showTechnicalDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </Button>
              </div>
            </div>

            <p className="whitespace-pre-wrap font-medium text-foreground">{comprobante.error_text}</p>

            {comprobante.error_code === "CONFIG" && comprobante.facturador_configurado && (
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300">
                Este error es de un intento anterior. La configuracion actual de produccion esta completa y ya puede reintentarse.
              </p>
            )}

            {/* Vista expandida de respuesta técnica */}
            {showTechnicalDetails && (
              <div className="rounded-md border bg-muted/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Respuesta detallada de la API / Facturador
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs gap-1"
                      onClick={() => handleCopyJson(comprobante.sunat_response || comprobante.error_text)}
                    >
                      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs gap-1"
                      onClick={() => downloadResponse("cdr")}
                    >
                      <Download className="size-3" />
                      JSON
                    </Button>
                  </div>
                </div>

                <pre className="max-h-56 overflow-auto rounded bg-black/80 p-2.5 text-xs text-emerald-400 font-mono">
                  {comprobante.sunat_response
                    ? JSON.stringify(comprobante.sunat_response, null, 2)
                    : comprobante.error_text}
                </pre>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {comprobante.cdr_path && (
                <Button type="button" size="sm" variant="outline" onClick={() => downloadResponse("cdr")}>
                  <Download className="mr-1 size-3.5" /> Descargar respuesta técnica (JSON)
                </Button>
              )}
              {hasZip && (
                <Button type="button" size="sm" variant="outline" onClick={() => downloadResponse("zip")}>
                  <ZipIcon className="mr-1 size-3.5" /> Descargar ZIP SUNAT
                </Button>
              )}
            </div>
          </div>
        )}

        {!editable && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            Este comprobante ya fue aceptado y no se puede modificar. Para corregirlo corresponde emitir una nota de credito.
          </div>
        )}

        <fieldset disabled={!editable || saving} className="space-y-4 disabled:opacity-70">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <span>Cliente: <strong>{getClientDisplayName(comprobante.cliente)}</strong>. El RUC y direccion se toman de su ficha.</span>
            <Button type="button" size="sm" variant="outline" asChild>
              <a href={`${ClientEditRoute}/${comprobante.cliente_id}`} target="_blank" rel="noreferrer">
                Editar cliente <ExternalLink className="ml-1 size-3.5" />
              </a>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.tipo_documento}
                onChange={(event) => setForm({ ...form, tipo_documento: event.target.value as TipoDocumento })}
              >
                <option value="F">Factura</option>
                <option value="B">Boleta</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Serie</Label>
              <Input value={form.serie} onChange={(event) => setForm({ ...form, serie: event.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <Label>Correlativo</Label>
              <Input type="number" min="1" value={form.correlativo} onChange={(event) => setForm({ ...form, correlativo: Number(event.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha_emision} onChange={(event) => setForm({ ...form, fecha_emision: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Pago</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.forma_pago}
                onChange={(event) => setForm({ ...form, forma_pago: event.target.value as "C" | "D" })}
              >
                <option value="C">Contado</option>
                <option value="D">Credito</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Detalles</Label>
              <Button type="button" size="sm" variant="outline" onClick={addDetail}>
                <Plus className="mr-1 size-4" /> Agregar linea
              </Button>
            </div>
            {form.detalles.map((detalle, index) => (
              <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_100px_150px_42px]">
                <Input placeholder="Descripcion" value={detalle.descripcion} onChange={(event) => updateDetail(index, { descripcion: event.target.value })} />
                <Input type="number" min="0.01" step="0.01" value={detalle.cantidad} onChange={(event) => updateDetail(index, { cantidad: Number(event.target.value) })} />
                <Input type="number" min="0.01" step="0.01" value={detalle.precio_unitario} onChange={(event) => updateDetail(index, { precio_unitario: Number(event.target.value) })} />
                <Button type="button" size="icon" variant="ghost" disabled={form.detalles.length === 1} onClick={() => removeDetail(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <div className="text-right text-sm font-semibold">Total con IGV: {form.moneda} {total.toFixed(2)}</div>
          </div>
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          {editable && (
            <>
              <Button variant="outline" disabled={saving} onClick={retryWithoutChanges}>
                <RotateCcw className={`mr-2 size-4 ${saving ? "animate-spin" : ""}`} />
                Reenviar sin cambios
              </Button>
              <Button variant="secondary" disabled={saving} onClick={() => save(false)}>
                <Save className="mr-2 size-4" /> Guardar
              </Button>
              <Button disabled={saving} onClick={() => save(true)}>
                <RotateCcw className={`mr-2 size-4 ${saving ? "animate-spin" : ""}`} />
                Guardar y reenviar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
