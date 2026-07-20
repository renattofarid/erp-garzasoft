import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  ReceiptText,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorToast } from "@/lib/core.function";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getContract, openContractPdf } from "@/pages/contract/lib/contract.actions";
import { ContractResource } from "@/pages/contract/lib/contract.interface";
import { getCuentasPorCobrar } from "@/pages/accounts-receivable/lib/accounts-receivable.actions";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import {
  downloadComprobanteFile,
  getComprobantePdf,
  getComprobantes,
} from "@/pages/invoicing/lib/invoicing.actions";
import { ComprobanteResource } from "@/pages/invoicing/lib/invoicing.interface";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const statusClass: Record<string, string> = {
  pendiente: "border-yellow-500/30 bg-yellow-500/15 text-yellow-500",
  vencido: "border-red-500/30 bg-red-500/15 text-red-500",
  pagado: "border-emerald-500/30 bg-emerald-500/15 text-emerald-500",
};

export default function ClientPortalPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractResource[]>([]);
  const [installments, setInstallments] = useState<CuentasPorCobrarResource[]>([]);
  const [invoices, setInvoices] = useState<ComprobanteResource[]>([]);

  useEffect(() => {
    Promise.all([
      getContract({ params: { page: 1, per_page: 100 } }),
      getCuentasPorCobrar({ params: { page: 1, per_page: 100 } }),
      getComprobantes({ page: 1, perPage: 100 }),
    ])
      .then(([contractResponse, installmentResponse, invoiceResponse]) => {
        setContracts(contractResponse.data || []);
        setInstallments(installmentResponse.data || []);
        setInvoices(invoiceResponse.data || []);
      })
      .catch(() => errorToast("No se pudo cargar tu portal de cliente."))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    return installments.reduce(
      (acc, item) => {
        acc.total += Number(item.monto_total || 0);
        acc.paid += Number(item.monto_pagado || 0);
        acc.pending += Number(item.monto_pendiente || 0);
        if (item.situacion === "vencido") acc.overdue += Number(item.monto_pendiente || 0);
        return acc;
      },
      { total: 0, paid: 0, pending: 0, overdue: 0 }
    );
  }, [installments]);

  const openPdf = async (id: number) => {
    try {
      const blob = await getComprobantePdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      errorToast("No se pudo abrir el PDF.");
    }
  };

  const downloadFile = async (invoice: ComprobanteResource, type: "xml" | "cdr") => {
    try {
      const blob = await downloadComprobanteFile(invoice.id, type);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.numero}.${type === "xml" ? "xml" : "cdr"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      errorToast(`No se pudo descargar el ${type.toUpperCase()}.`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Cargando portal...
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <TitleComponent
        title="Mi portal"
        subtitle="Contratos, cronograma de pagos y comprobantes disponibles."
        icon="FolderOpen"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total contratado" value={currency.format(totals.total)} icon={FolderOpen} />
        <SummaryCard title="Pagado" value={currency.format(totals.paid)} icon={CheckCircle2} />
        <SummaryCard title="Pendiente" value={currency.format(totals.pending)} icon={CalendarClock} />
        <SummaryCard title="Vencido" value={currency.format(totals.overdue)} icon={ReceiptText} />
      </div>

      <Card className="border-border bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>{user?.cliente?.razon_social || user?.cliente?.nombre_comercial || "Mi empresa"}</CardTitle>
          <CardDescription>RUC: {user?.cliente?.ruc || "No registrado"}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="min-w-0 border-border bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Mis archivos</CardTitle>
          <CardDescription>Documentos de contrato disponibles para descarga.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contracts.length === 0 ? (
              <EmptyState text="No hay contratos registrados." />
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium">Contrato {contract.numero}</div>
                    <div className="text-sm text-muted-foreground">
                      {contract.tipo_contrato} - {contract.fecha_inicio} al {contract.fecha_fin}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openContractPdf(contract.id)}>
                    <FileText className="mr-2 size-4" />
                    PDF
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Cronograma de pagos</CardTitle>
            <CardDescription>Cuotas pendientes, vencidas y pagadas.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Pendiente</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No tienes cuotas registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  installments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.contrato?.numero || "-"}</TableCell>
                      <TableCell>{item.fecha_vencimiento}</TableCell>
                      <TableCell>{currency.format(Number(item.monto_total || 0))}</TableCell>
                      <TableCell>{currency.format(Number(item.monto_pagado || 0))}</TableCell>
                      <TableCell>{currency.format(Number(item.monto_pendiente || 0))}</TableCell>
                      <TableCell>
                        <Badge className={statusClass[item.situacion] || ""}>{item.situacion}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 border-border bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Mis facturas</CardTitle>
          <CardDescription>Descarga PDF, XML y CDR de tus comprobantes.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Descargas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No tienes comprobantes emitidos.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.numero}</TableCell>
                    <TableCell>{invoice.fecha_emision}</TableCell>
                    <TableCell>{invoice.moneda} {Number(invoice.total || 0).toFixed(2)}</TableCell>
                    <TableCell>{invoice.estado_label}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openPdf(invoice.id)}>
                          <FileText className="mr-2 size-4" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(invoice, "xml")} disabled={!invoice.xml_path}>
                          <Download className="mr-2 size-4" />
                          XML
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(invoice, "cdr")} disabled={!invoice.cdr_path}>
                          <Download className="mr-2 size-4" />
                          CDR
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="border-border bg-card/80 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 py-5">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 break-words text-xl font-semibold">{value}</div>
        </div>
        <div className="rounded-lg border bg-primary/10 p-2">
          <Icon className="size-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
