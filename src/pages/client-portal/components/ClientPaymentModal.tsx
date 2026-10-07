import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, ExternalLink, FileUp, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { confirmKutiPayment, createKutiCheckout } from "@/pages/accounts-receivable/lib/kuti.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { submitManualPayment } from "../lib/manual-payment.actions";

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

type PaymentView = "summary" | "manual" | "manual-success" | "loading" | "checkout" | "success";
const checkoutContainerId = "kuti-checkout-inline";
const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 });

export function ClientPaymentModal({ open, onOpenChange, cuota, onPaymentFinished }: Props) {
  const [view, setView] = useState<PaymentView>("summary");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualSubmitting, setManualSubmitting] = useState(false);
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
      setManualFile(null);
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
      if (!checkout.checkout_url) throw new Error("Kuti no devolvio una URL de pago.");
      setCheckoutUrl(checkout.checkout_url);
      setView("checkout");
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
            try { await confirmKutiPayment(cuota.id, paymentIntentId); } catch { /* El webhook puede confirmar despues. */ }
            setView("success");
            successToast("Pago recibido correctamente.");
            onPaymentFinished?.();
            refreshTimer.current = window.setTimeout(() => onPaymentFinished?.(), 1800);
          },
          onFailure: () => { errorToast("El pago no se completo. Puedes intentarlo nuevamente."); setView("summary"); },
          onExpired: () => { errorToast("El checkout vencio. Intenta nuevamente."); setView("summary"); },
          onError: (error) => { errorToast(error.message || "No se pudo cargar Kuti."); setView("summary"); },
        });
      }, 80);
    } catch (error: any) {
      setView("summary");
      errorToast(error?.response?.data?.message || error?.message || "No se pudo iniciar el pago.");
    }
  };

  const submitManual = async () => {
    if (!manualFile) {
      errorToast("Adjunta una imagen o PDF del comprobante.");
      return;
    }
    setManualSubmitting(true);
    try {
      await submitManualPayment(cuota.id, {
        fecha_pago: new Date().toISOString().slice(0, 10),
        monto_pagado: amount,
        comprobante: manualFile,
      });
      setView("manual-success");
      successToast("Comprobante enviado para revisión.");
      onPaymentFinished?.();
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudo enviar el comprobante.");
    } finally {
      setManualSubmitting(false);
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
        className="w-[calc(100%-1rem)] max-w-6xl sm:w-[calc(100%-2rem)] sm:max-w-6xl max-h-[94vh] overflow-hidden gap-0 rounded-2xl border border-slate-200 bg-[#fbfbfa] p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex max-h-[94vh] flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <aside className="bg-[#f1f3f1] px-7 py-7 text-slate-900 dark:bg-slate-900 dark:text-white lg:w-[31%] lg:border-r lg:border-slate-200 lg:px-10 lg:py-10 dark:lg:border-slate-800">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"><CreditCard className="h-4 w-4" /></div>
                Pago de servicio
              </div>
              <div className="mt-12 lg:mt-auto">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Resumen del pago</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Cuota de servicio</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Contrato {contract}</p>
                <div className="mt-10 border-y border-slate-300/70 py-6 dark:border-slate-700">
                  <p className="text-xs text-slate-500">Importe pendiente</p>
                  <p className="mt-2 font-mono text-5xl font-semibold tracking-[-0.05em]">{currency.format(amount)}</p>
                </div>
              </div>
              <div className="mt-8 space-y-3 text-xs text-slate-500 dark:text-slate-400 lg:mt-10">
                <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-slate-700 dark:text-slate-300" /> Conexion cifrada</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" /> Confirmacion automatica</div>
                    <p className="pt-3 text-[11px] leading-5 text-slate-400">Elige entre pago manual con validación o pago en línea.</p>
              </div>
            </div>
          </aside>

          <section className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-10">
              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Completa tu pago</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">Selecciona tu medio de pago y sigue las instrucciones.</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={close} className="rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Cerrar pago"><ArrowLeft className="h-4 w-4" /></Button>
            </div>

            <div className="p-6 sm:p-10">
              {view === "summary" && (
                <div className="mx-auto max-w-2xl">
                  <div className="border-y border-slate-200 py-2 dark:border-slate-800">
                    {[["Servicio", "Cuota de servicio"], ["Contrato", contract], ["Estado", cuota.situacion], ["Importe", currency.format(amount)]].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-6 border-b border-slate-100 py-4 text-sm last:border-0 dark:border-slate-900">
                        <span className="text-slate-500">{label}</span>
                        <span className={`text-right font-medium ${label === "Importe" ? "font-mono text-lg text-slate-950 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => setView("manual")} className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><FileUp className="h-5 w-5" /></div><span className="text-slate-400 transition group-hover:translate-x-0.5">→</span></div>
                      <p className="mt-4 font-semibold text-slate-950 dark:text-white">Pago manual</p><p className="mt-1 text-xs leading-5 text-slate-500">Sube tu comprobante. Lo revisaremos antes de aplicar el pago.</p>
                    </button>
                    <button type="button" onClick={startCheckout} className="group rounded-xl border border-slate-900 bg-slate-950 p-5 text-left text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                      <div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 dark:bg-slate-100"><CreditCard className="h-5 w-5" /></div><ExternalLink className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" /></div>
                      <p className="mt-4 font-semibold">Pago en línea</p><p className="mt-1 text-xs leading-5 opacity-70">Paga de forma segura con QR o desde tu banca.</p>
                    </button>
                  </div>
                  <p className="mt-4 text-center text-xs text-slate-500">Selecciona la alternativa que prefieras para completar esta cuota.</p>
                </div>
              )}

              {view === "manual" && (
                <div className="mx-auto max-w-2xl">
                  <button type="button" onClick={() => setView("summary")} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Volver a medios de pago</button>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pago manual</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">Adjunta tu comprobante</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">El administrador validará el importe y el comprobante. La cuota no cambiará a pagada hasta su aprobación.</p>
                    <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-950">
                      <FileUp className="h-7 w-7 text-slate-500" />
                      <span className="mt-3 text-sm font-medium">{manualFile ? manualFile.name : "Selecciona una imagen o PDF"}</span>
                      <span className="mt-1 text-xs text-slate-500">Máximo 5 MB</span>
                      <input type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(event) => setManualFile(event.target.files?.[0] || null)} />
                    </label>
                    <Button disabled={manualSubmitting || !manualFile} onClick={submitManual} className="mt-5 h-12 w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">{manualSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />} Enviar comprobante</Button>
                  </div>
                </div>
              )}

              {view === "manual-success" && (
                <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><CheckCircle2 className="h-14 w-14 text-amber-600" /><h3 className="mt-6 text-2xl font-semibold tracking-tight">Comprobante enviado</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Tu solicitud quedó pendiente de revisión. Te avisaremos cuando el administrador valide el pago.</p><Button onClick={close} className="mt-7 rounded-lg bg-slate-950 px-7 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">Volver a mi portal</Button></div>
              )}

              {view === "loading" && (
                <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" /><h3 className="mt-5 text-lg font-semibold">Preparando tu pago</h3><p className="mt-2 text-sm text-slate-500">Estamos creando una sesion segura con Kuti.</p></div>
              )}

              {view === "checkout" && checkoutUrl && (
                <div className="mx-auto max-w-4xl">
                  <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-base font-semibold tracking-tight">Pago en línea</p><p className="mt-1 text-sm text-slate-500">Paga con QR o desde tu banca.</p></div><span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><LockKeyhole className="h-3.5 w-3.5" /> Pago seguro</span></div>
                  <div id={checkoutContainerId} className="min-h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-[#fafaf9] dark:border-slate-800 dark:bg-slate-900/50" />
                </div>
              )}

              {view === "success" && (
                <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><CheckCircle2 className="h-14 w-14 text-emerald-600" /><h3 className="mt-6 text-2xl font-semibold tracking-tight">Pago confirmado</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Tu pago en línea fue recibido. El estado de la cuota se actualizará automáticamente en tu portal.</p><Button onClick={close} className="mt-7 rounded-lg bg-slate-950 px-7 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">Volver a mi portal</Button></div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
