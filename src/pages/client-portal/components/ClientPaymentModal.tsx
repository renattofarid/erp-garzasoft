import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { confirmKutiPayment, createKutiCheckout } from "@/pages/accounts-receivable/lib/kuti.actions";
import { errorToast, successToast } from "@/lib/core.function";

declare global {
  interface Window {
    Kuti?: { open: (options: { checkoutUrl: string; onSuccess?: (data: { paymentIntentId: string }) => void; onFailure?: () => void; onExpired?: () => void; onError?: (error: { message?: string }) => void }) => void; close: () => void };
  }
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cuota: CuentasPorCobrarResource | null;
  onPaymentFinished?: () => void;
}

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 });

export function ClientPaymentModal({ open, onOpenChange, cuota, onPaymentFinished }: Props) {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!document.querySelector('script[data-kuti-checkout]')) {
      const script = document.createElement("script");
      script.src = "https://js.kuti.pe/v1/kuti.global.js";
      script.async = true;
      script.dataset.kutiCheckout = "true";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!open) setCheckoutUrl(null);
  }, [open]);

  if (!cuota) return null;
  const amount = Number(cuota.monto_pendiente || cuota.monto_total || 0);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const checkout = await createKutiCheckout(cuota.id);
      setCheckoutUrl(checkout.checkout_url);
      if (!window.Kuti) throw new Error("No se pudo cargar el checkout de Kuti.");
      window.Kuti.open({
        checkoutUrl: checkout.checkout_url,
        onSuccess: async ({ paymentIntentId }) => {
          try { await confirmKutiPayment(cuota.id, paymentIntentId); } catch { /* El webhook puede confirmar unos segundos después. */ }
          successToast("Pago recibido. Estamos actualizando tu cuota.");
          onOpenChange(false);
          onPaymentFinished?.();
        },
        onFailure: () => errorToast("Kuti rechazó el pago."),
        onExpired: () => errorToast("El checkout de Kuti venció. Intenta nuevamente."),
        onError: (error) => errorToast(error.message || "No se pudo abrir Kuti."),
      });
    } catch (error: any) {
      errorToast(error?.response?.data?.message || error?.message || "No se pudo iniciar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600" /> Pagar cuota en línea</DialogTitle>
          <DialogDescription>Contrato {cuota.contrato?.numero || `ID #${cuota.contrato_id}`}</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="text-xs text-muted-foreground">Saldo pendiente</div>
          <div className="mt-1 text-3xl font-extrabold font-mono">{currency.format(amount)}</div>
          <Badge variant="outline" className="mt-3">{cuota.situacion}</Badge>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Pago seguro con Kuti</div>
          <p className="mt-1">Paga con QR interoperable (Yape, Plin) o desde tu banca buscando Kuti.</p>
        </div>
        <Button onClick={startCheckout} disabled={loading || Boolean(checkoutUrl)} className="w-full bg-emerald-600 hover:bg-emerald-700">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando pago...</> : <><ExternalLink className="mr-2 h-4 w-4" /> Continuar con Kuti</>}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
