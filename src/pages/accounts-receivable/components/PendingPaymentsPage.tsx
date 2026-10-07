import { useEffect, useState } from "react";
import { Check, ExternalLink, FileCheck2, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/components/TitleComponent";
import { api } from "@/lib/config";
import { errorToast, successToast } from "@/lib/core.function";
import { approvePago, getPagos, rejectPago } from "../lib/accounts-receivable.actions";
import { PagoResource } from "../lib/accounts-receivable.interface";

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<PagoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

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

  const review = async (payment: PagoResource, action: "approve" | "reject") => {
    setProcessing(payment.id);
    try {
      if (action === "approve") {
        const comment = window.prompt("Comentario para el cliente (opcional):", "");
        if (comment === null) return;
        await approvePago(payment.id, comment.trim() || undefined);
        successToast("Comprobante aprobado y cuota actualizada.");
      } else {
        const reason = window.prompt("Comentario para el cliente (opcional):", "");
        if (reason === null) return;
        await rejectPago(payment.id, reason.trim() || undefined);
        successToast("Comprobante rechazado.");
      }
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
              <Button size="sm" onClick={() => review(payment, "approve")} disabled={processing === payment.id}><Check className="mr-2 h-4 w-4" /> Aprobar</Button>
              <Button variant="destructive" size="sm" onClick={() => review(payment, "reject")} disabled={processing === payment.id}><X className="mr-2 h-4 w-4" /> Rechazar</Button>
            </div>
          </div>;
        })}</div>}
      </div>
    </div>
  );
}
