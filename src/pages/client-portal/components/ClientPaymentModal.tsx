import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import {
  confirmKutiPayment,
  createKutiCheckout,
} from "@/pages/accounts-receivable/lib/kuti.actions";
import { errorToast, successToast } from "@/lib/core.function";

declare global {
  interface Window {
    Kuti?: {
      open: (options: {
        checkoutUrl: string;
        containerId?: string;
        onSuccess?: (data: { paymentIntentId: string }) => void;
        onFailure?: () => void;
        onExpired?: () => void;
        onError?: (error: { message?: string }) => void;
      }) => void;
      close: () => void;
    };
  }
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cuota: CuentasPorCobrarResource | null;
  onPaymentFinished?: () => void;
}

type PaymentView = "summary" | "loading" | "checkout" | "success";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const checkoutContainerId = "kuti-checkout-inline";

export function ClientPaymentModal({
  open,
  onOpenChange,
  cuota,
  onPaymentFinished,
}: Props) {
  const [view, setView] = useState<PaymentView>("summary");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!document.querySelector("script[data-kuti-checkout]")) {
      const script = document.createElement("script");
      script.src = "https://js.kuti.pe/v1/kuti.global.js";
      script.async = true;
      script.dataset.kutiCheckout = "true";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      window.Kuti?.close();
      setView("summary");
      setCheckoutUrl(null);
    }

    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      window.Kuti?.close();
    };
  }, [open]);

  if (!cuota) return null;

  const amount = Number(cuota.monto_pendiente || cuota.monto_total || 0);
  const contract = cuota.contrato?.numero || `ID #${cuota.contrato_id}`;

  const startCheckout = async () => {
    setView("loading");
    try {
      const checkout = await createKutiCheckout(cuota.id);
      if (!checkout.checkout_url) throw new Error("Kuti no devolvió una URL de pago.");

      setCheckoutUrl(checkout.checkout_url);
      setView("checkout");

      // El checkout se incrusta en esta misma ventana: no se apilan modales.
      window.setTimeout(() => {
        if (!window.Kuti) {
          errorToast("No se pudo cargar el checkout de Kuti.");
          setView("summary");
          return;
        }

        window.Kuti.open({
          checkoutUrl: checkout.checkout_url,
          containerId: checkoutContainerId,
          onSuccess: async ({ paymentIntentId }) => {
            try {
              await confirmKutiPayment(cuota.id, paymentIntentId);
            } catch {
              // El webhook puede confirmar el pago unos segundos después.
            }
            setView("success");
            successToast("Pago recibido correctamente.");
            onPaymentFinished?.();
            refreshTimer.current = window.setTimeout(() => onPaymentFinished?.(), 1800);
          },
          onFailure: () => {
            errorToast("El pago no se completó. Puedes intentarlo nuevamente.");
            setView("summary");
          },
          onExpired: () => {
            errorToast("El checkout venció. Generaremos una nueva sesión.");
            setView("summary");
          },
          onError: (error) => {
            errorToast(error.message || "No se pudo cargar Kuti.");
            setView("summary");
          },
        });
      }, 80);
    } catch (error: any) {
      setView("summary");
      errorToast(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo iniciar el pago."
      );
    }
  };

  const close = () => {
    window.Kuti?.close();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl w-[calc(100%-1.5rem)] max-h-[min(92vh,860px)] overflow-hidden gap-0 rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex max-h-[min(92vh,860px)] flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <aside className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white lg:w-[38%] lg:px-8 lg:py-9">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/90">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <CreditCard className="h-4 w-4 text-emerald-300" />
                  </div>
                  Pago de servicio
                </div>
                <Badge className="border-white/10 bg-white/10 text-[10px] text-white/75 hover:bg-white/10">
                  Seguro
                </Badge>
              </div>

              <div className="mt-10 lg:mt-auto">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">Estás pagando</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Cuota de servicio</h2>
                <p className="mt-2 text-sm text-white/60">Contrato {contract}</p>
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs text-white/50">Total a pagar</p>
                  <p className="mt-1 font-mono text-4xl font-bold tracking-tight">{currency.format(amount)}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-white/10 pt-5 text-xs text-white/65 lg:mt-10">
                <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-300" /> Transacción protegida</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Confirmación automática</div>
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-300" /> QR, Yape, Plin y banca</div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 sm:px-8">
              <div>
                <DialogTitle className="text-base font-bold text-slate-950 dark:text-white">Completa tu pago</DialogTitle>
                <DialogDescription className="mt-1 text-xs text-slate-500">No cierres esta ventana mientras procesamos la operación.</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={close} className="rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Cerrar pago">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 sm:p-8">
              {view === "summary" && (
                <div className="mx-auto max-w-xl">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Saldo pendiente</p>
                        <p className="mt-2 font-mono text-3xl font-bold text-slate-950 dark:text-white">{currency.format(amount)}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{cuota.situacion}</Badge>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["Genera tu checkout", "Elige cómo pagar", "Recibe confirmación"].map((label, index) => (
                      <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <span className="text-xs font-bold text-emerald-600">0{index + 1}</span>
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={startCheckout} className="mt-7 h-12 w-full rounded-xl bg-emerald-600 text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
                    <ExternalLink className="mr-2 h-4 w-4" /> Continuar con Kuti
                  </Button>
                  <p className="mt-4 text-center text-[11px] text-slate-500">Serás atendido dentro de esta misma ventana.</p>
                </div>
              )}

              {view === "loading" && (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40"><Loader2 className="h-7 w-7 animate-spin text-emerald-600" /></div>
                  <h3 className="mt-5 text-lg font-bold">Preparando tu pago</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">Estamos creando una sesión segura con Kuti.</p>
                </div>
              )}

              {view === "checkout" && checkoutUrl && (
                <div className="mx-auto max-w-2xl">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><p className="text-sm font-bold">Elige tu medio de pago</p><p className="text-xs text-slate-500">Paga con QR o desde tu banca.</p></div>
                    <Badge variant="outline" className="gap-1 text-[10px]"><LockKeyhole className="h-3 w-3" /> Kuti seguro</Badge>
                  </div>
                  <div id={checkoutContainerId} className="min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50" />
                </div>
              )}

              {view === "success" && (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50"><CheckCircle2 className="h-10 w-10 text-emerald-600" /></div>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight">¡Pago confirmado!</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Tu pago fue recibido. El estado de la cuota se actualizará automáticamente en tu portal.</p>
                  <Button onClick={close} className="mt-7 rounded-xl bg-slate-950 px-7 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Volver a mi portal</Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
