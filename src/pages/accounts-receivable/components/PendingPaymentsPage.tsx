import { useEffect, useState } from "react";
import { Check, ExternalLink, FileCheck2, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TitleComponent from "@/components/TitleComponent";
import { api } from "@/lib/config";
import { errorToast, successToast } from "@/lib/core.function";
import { approvePago, getPagos, rejectPago } from "../lib/accounts-receivable.actions";
import { PagoResource } from "../lib/accounts-receivable.interface";

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<PagoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [reviewPayment, setReviewPayment] = useState<PagoResource | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await getPagos({ estado_revision: "pendiente", per_page: 100 });
      setPayments(response.data);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudieron cargar los comprobantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openReview = (payment: PagoResource, action: "approve" | "reject") => {
    setReviewPayment(payment);
    setReviewAction(action);
    setReviewComment("");
  };

  const closeReview = () => {
    if (processing !== null) return;
    setReviewPayment(null);
    setReviewAction(null);
    setReviewComment("");
  };

  const review = async () => {
    if (!reviewPayment || !reviewAction) return;
    const payment = reviewPayment;
    const action = reviewAction;
    setProcessing(payment.id);
    try {
      if (action === "approve") {
        await approvePago(payment.id, reviewComment.trim() || undefined);
        successToast("Comprobante aprobado y cuota actualizada.");
      } else {
        await rejectPago(payment.id, reviewComment.trim() || undefined);
        successToast("Comprobante rechazado.");
      }
      setReviewPayment(null);
      setReviewAction(null);
      setReviewComment("");
      await load();
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudo actualizar el comprobante.");
    } finally {
      setProcessing(null);
    }
  };

  const openReceipt = async (payment: PagoResource) => {
    try {
      const { data } = await api.get(`pagos/${payment.id}/comprobante`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      errorToast("No se pudo abrir el comprobante.");
    }
  };

  return (
    <div className="space-y-6">
      <TitleComponent title="Pagos por aprobar" subtitle="Revisa los comprobantes enviados por los clientes antes de aplicar el pago." icon="FileCheck2" />
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div><p className="text-sm font-semibold">Bandeja de revisión</p><p className="mt-1 text-xs text-muted-foreground">{payments.length} comprobante{payments.length === 1 ? "" : "s"} pendiente{payments.length === 1 ? "" : "s"}</p></div>
          <Button variant="outline" size="sm" onClick={load}>Actualizar</Button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : payments.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-center"><FileCheck2 className="h-10 w-10 text-emerald-500" /><p className="mt-4 font-medium">Todo está al día</p><p className="mt-1 text-sm text-muted-foreground">No hay comprobantes pendientes de revisión.</p></div> : <div className="space-y-3">{payments.map((payment) => {
          const cuota = payment.cuota;
          const cliente = cuota?.contrato?.cliente;
          return <div key={payment.id} className="grid gap-4 rounded-xl border border-border/80 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-4 sm:items-center">
              <div><p className="text-xs text-muted-foreground">Cliente</p><p className="mt-1 font-medium">{cliente?.razon_social || cliente?.nombre_cliente || cliente?.dueno_nombre || "Cliente"}</p></div>
              <div><p className="text-xs text-muted-foreground">Contrato / cuota</p><p className="mt-1 font-medium">{cuota?.contrato?.numero || "—"} / #{payment.cuota_id}</p></div>
              <div><p className="text-xs text-muted-foreground">Importe</p><p className="mt-1 font-mono font-semibold">S/ {Number(payment.monto_pagado).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Fecha reportada</p><p className="mt-1 font-medium">{payment.fecha_pago || "—"}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button variant="outline" size="sm" onClick={() => openReceipt(payment)} disabled={!payment.comprobante}><FileText className="mr-2 h-4 w-4" /> Ver comprobante <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              <Button size="sm" onClick={() => openReview(payment, "approve")} disabled={processing === payment.id}><Check className="mr-2 h-4 w-4" /> Aprobar</Button>
              <Button variant="destructive" size="sm" onClick={() => openReview(payment, "reject")} disabled={processing === payment.id}><X className="mr-2 h-4 w-4" /> Rechazar</Button>
            </div>
          </div>;
        })}</div>}
      </div>
      <Dialog open={reviewPayment !== null} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="border-b border-border/70 bg-muted/30 px-6 py-5 text-left">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${reviewAction === "approve" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                {reviewAction === "approve" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle>{reviewAction === "approve" ? "Aprobar comprobante" : "Rechazar comprobante"}</DialogTitle>
                <DialogDescription className="mt-1">{reviewAction === "approve" ? "Confirma que el pago fue validado correctamente." : "Indica al cliente qué debe corregir o revisar."}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Cliente</p><p className="mt-1 font-medium">{reviewPayment?.cuota?.contrato?.cliente?.razon_social || reviewPayment?.cuota?.contrato?.cliente?.nombre_cliente || reviewPayment?.cuota?.contrato?.cliente?.dueno_nombre || "Cliente"}</p></div>
              <div><p className="text-xs text-muted-foreground">Importe</p><p className="mt-1 font-mono font-semibold">S/ {Number(reviewPayment?.monto_pagado || 0).toFixed(2)}</p></div>
            </div>
            <div>
              <label htmlFor="review-comment" className="mb-2 block text-sm font-medium">Comentario <span className="font-normal text-muted-foreground">(opcional)</span></label>
              <Textarea id="review-comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder={reviewAction === "approve" ? "Ej. Pago validado correctamente." : "Ej. La imagen no permite verificar la operación."} maxLength={1000} className="min-h-28 resize-none" disabled={processing !== null} />
              <p className="mt-1.5 text-right text-xs text-muted-foreground">{reviewComment.length}/1000</p>
            </div>
          </div>
          <DialogFooter className="border-t border-border/70 px-6 py-4 sm:flex-row">
            <Button variant="outline" onClick={closeReview} disabled={processing !== null}>Cancelar</Button>
            <Button variant={reviewAction === "reject" ? "destructive" : "default"} onClick={review} disabled={processing !== null}>
              {processing !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : reviewAction === "approve" ? <Check className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
              {reviewAction === "approve" ? "Confirmar aprobación" : "Confirmar rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
