import React, { useEffect, useState } from "react";
import { MessageSquare, Phone, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ComprobanteResource } from "../lib/invoicing.interface";
import { enviarComprobanteWhatsApp } from "../lib/invoicing.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";

interface WhatsAppComprobanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comprobante: ComprobanteResource | null;
  onSuccess?: () => void;
}

export function WhatsAppComprobanteModal({
  open,
  onOpenChange,
  comprobante,
  onSuccess,
}: WhatsAppComprobanteModalProps) {
  const [celular, setCelular] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && comprobante) {
      // Intentar obtener número de teléfono del comprobante o del cliente
      const phone =
        comprobante.celular_envio_cliente ||
        comprobante.cliente?.dueno_celular ||
        comprobante.cliente?.representante_celular ||
        comprobante.cliente?.responsable_celular ||
        comprobante.cliente?.contacto_principal?.celular ||
        "";
      setCelular(phone);
    }
  }, [open, comprobante]);

  if (!comprobante) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!celular.trim()) {
      errorToast("Por favor ingrese un número de celular válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await enviarComprobanteWhatsApp(comprobante.id, celular);
      successToast(res.message || "Comprobante enviado exitosamente por WhatsApp.");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "No se pudo enviar el comprobante por WhatsApp.";
      errorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full p-6 gap-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Enviar por WhatsApp
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Envía el documento PDF del comprobante al cliente a través de WhatsApp Cloud API.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-lg border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Comprobante:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {comprobante.numero}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                {getClientDisplayName(comprobante.cliente)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Monto Total:</span>
              <Badge variant="secondary" className="font-bold">
                {comprobante.moneda} {comprobante.total}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="celular" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Número de Celular WhatsApp
            </Label>
            <Input
              id="celular"
              type="tel"
              placeholder="Ej: 987654321 o 51987654321"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="h-9 text-sm"
              required
            />
            <p className="text-[11px] text-slate-500">
              Incluye prefijo internacional o 9 dígitos para Perú (ej. 51987654321).
            </p>
          </div>

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
              type="submit"
              disabled={loading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar WhatsApp
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
