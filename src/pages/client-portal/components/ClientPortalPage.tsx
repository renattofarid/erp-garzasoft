"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCode2,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  ReceiptText,
  Search,
  ShieldCheck,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { errorToast } from "@/lib/core.function";
import { openPdfFromFetcher } from "@/lib/pdf";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getContract, openContractPdf } from "@/pages/contract/lib/contract.actions";
import { ContractResource } from "@/pages/contract/lib/contract.interface";
import {
  castContractType,
  castPaymentType,
  getIconByContractType,
  getIconByPaymentType,
} from "@/pages/contract/lib/contract.function";
import { getCuentasPorCobrar } from "@/pages/accounts-receivable/lib/accounts-receivable.actions";
import { CuentasPorCobrarResource } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import {
  downloadComprobanteFile,
  getComprobantePdf,
  getComprobantes,
} from "@/pages/invoicing/lib/invoicing.actions";
import { ComprobanteResource } from "@/pages/invoicing/lib/invoicing.interface";
import { format, parseISO } from "date-fns";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const statusBadgeVariant: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  vencido: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
  },
  pagado: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
};

function formatDisplayDate(dateString?: string | null): string {
  if (!dateString) return "-";
  try {
    const cleanStr = dateString.split("T").shift() || dateString;
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    const parsed = parseISO(dateString);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, "dd/MM/yyyy");
    }
    return dateString;
  } catch {
    return dateString || "-";
  }
}

export default function ClientPortalPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractResource[]>([]);
  const [installments, setInstallments] = useState<CuentasPorCobrarResource[]>([]);
  const [invoices, setInvoices] = useState<ComprobanteResource[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [installmentFilter, setInstallmentFilter] = useState<"todos" | "pendiente" | "vencido" | "pagado">("todos");

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
      .catch(() => errorToast("No se pudo cargar la información de tu portal."))
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

  const percentPaid = useMemo(() => {
    if (!totals.total || totals.total <= 0) return 0;
    return Math.min(100, Math.round((totals.paid / totals.total) * 100));
  }, [totals]);

  const filteredInstallments = useMemo(() => {
    if (installmentFilter === "todos") return installments;
    return installments.filter((item) => item.situacion === installmentFilter);
  }, [installments, installmentFilter]);

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch.trim()) return invoices;
    const query = invoiceSearch.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.numero?.toLowerCase().includes(query) ||
        inv.fecha_emision?.toLowerCase().includes(query) ||
        inv.estado_label?.toLowerCase().includes(query)
    );
  }, [invoices, invoiceSearch]);

  const openPdf = async (id: number) => {
    try {
      await openPdfFromFetcher(
        () => getComprobantePdf(id),
        "Generando comprobante..."
      );
    } catch (err: any) {
      errorToast(err.message || "No se pudo abrir el PDF.");
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Cargando tu portal de cliente...</p>
      </div>
    );
  }

  const cliente = user?.cliente;

  return (
    <div className="min-w-0 space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TitleComponent
          title="Portal del Cliente"
          subtitle="Consulta y descarga tus contratos, cronograma de pagos y comprobantes electrónicos."
          icon="FolderOpen"
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-primary/5 text-primary border-primary/20 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Portal Seguro
          </Badge>
        </div>
      </div>

      {/* Tarjeta de Perfil de Empresa */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">
                  {cliente?.razon_social || cliente?.nombre_comercial || "Mi Empresa"}
                </h2>
                {cliente?.tipo && (
                  <Badge variant="secondary" className="capitalize text-xs font-medium">
                    {cliente.tipo}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>RUC: <strong className="text-foreground font-mono">{cliente?.ruc || "No registrado"}</strong></span>
                {cliente?.nombre_comercial && cliente?.razon_social && (
                  <>
                    <span>•</span>
                    <span>{cliente.nombre_comercial}</span>
                  </>
                )}
              </p>
              {cliente?.direccion && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{cliente.direccion}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
            {cliente?.dueno_celular && (
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <Phone className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="font-semibold text-foreground">{cliente.dueno_celular}</div>
                  <div className="text-[10px] text-muted-foreground">Teléfono Contacto</div>
                </div>
              </div>
            )}
            {cliente?.dueno_email && (
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <Mail className="h-4 w-4 text-sky-500" />
                <div>
                  <div className="font-semibold text-foreground">{cliente.dueno_email}</div>
                  <div className="text-[10px] text-muted-foreground">Email Notificaciones</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen Financiero */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryKpiCard
          title="Total Contratado"
          value={currency.format(totals.total)}
          subtitle={`${contracts.length} contrato${contracts.length !== 1 ? "s" : ""} registrado${contracts.length !== 1 ? "s" : ""}`}
          icon={FolderOpen}
          gradient="from-blue-500/10 to-indigo-500/5"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <SummaryKpiCard
          title="Total Pagado"
          value={currency.format(totals.paid)}
          subtitle={`${percentPaid}% amortizado`}
          icon={CheckCircle2}
          gradient="from-emerald-500/10 to-teal-500/5"
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/10"
          progress={percentPaid}
        />
        <SummaryKpiCard
          title="Saldo Pendiente"
          value={currency.format(totals.pending)}
          subtitle={`${installments.filter((i) => i.situacion === "pendiente").length} cuotas por vencer`}
          icon={CalendarClock}
          gradient="from-amber-500/10 to-yellow-500/5"
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <SummaryKpiCard
          title="Monto Vencido"
          value={currency.format(totals.overdue)}
          subtitle={
            totals.overdue > 0
              ? `${installments.filter((i) => i.situacion === "vencido").length} cuotas pendientes de pago`
              : "Al día sin retrasos"
          }
          icon={ReceiptText}
          gradient={totals.overdue > 0 ? "from-rose-500/15 to-red-500/10" : "from-emerald-500/10 to-teal-500/5"}
          iconColor={totals.overdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}
          iconBg={totals.overdue > 0 ? "bg-rose-500/15" : "bg-emerald-500/10"}
          alert={totals.overdue > 0}
        />
      </div>

      {/* Pestañas de Contenido */}
      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg h-11 p-1 bg-muted/60">
          <TabsTrigger value="contracts" className="text-xs sm:text-sm font-medium gap-2">
            <FileText className="h-4 w-4" />
            <span>Mis Contratos ({contracts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="installments" className="text-xs sm:text-sm font-medium gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Cronograma ({installments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs sm:text-sm font-medium gap-2">
            <Receipt className="h-4 w-4" />
            <span>Facturación ({invoices.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONTRATOS Y SERVICIOS */}
        <TabsContent value="contracts" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Contratos y Servicios Activos</h3>
              <p className="text-xs text-muted-foreground">
                Documentos contractuales con vigencia, módulos incluidos y descarga en PDF.
              </p>
            </div>
          </div>

          {contracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay contratos disponibles"
              description="Actualmente no tienes contratos registrados en tu cuenta."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contracts.map((contract) => {
                const ContractIcon = getIconByContractType(contract.tipo_contrato) || FileText;
                const PaymentIcon = getIconByPaymentType(contract.forma_pago) || ReceiptText;
                const modulos = contract.contrato_producto_modulos || [];

                return (
                  <Card key={contract.id} className="relative overflow-hidden border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80" />
                    <CardHeader className="pb-3 pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ContractIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                              <span>Contrato {contract.numero}</span>
                              <Badge
                                variant={contract.estado === "anulado" ? "destructive" : "secondary"}
                                className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0"
                              >
                                {contract.estado === "anulado" ? "Anulado" : "Activo"}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1.5 pt-0.5">
                              <Badge variant="outline" className="text-[11px] font-normal capitalize">
                                {castContractType(contract.tipo_contrato)}
                              </Badge>
                              <span>•</span>
                              <span className="capitalize">{contract.vigencia_contrato || "Anual"}</span>
                            </CardDescription>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openContractPdf(contract.id)}
                          className="h-8 gap-1.5 text-xs font-semibold shadow-xs shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver PDF</span>
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-1">
                      {/* Fechas de Vigencia */}
                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Fecha Inicio
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatDisplayDate(contract.fecha_inicio)}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Fecha Fin / Vencimiento
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatDisplayDate(contract.fecha_fin)}
                          </span>
                        </div>
                      </div>

                      {/* Módulos y Productos Incluidos */}
                      {modulos.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>Módulos y Servicios Incluidos ({modulos.length}):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {modulos.map((m) => {
                              const moduleName = m.modulo?.nombre || (m.producto as any)?.nombre || m.producto?.name || `Módulo #${m.modulo_id}`;
                              return (
                                <Badge key={m.id} variant="secondary" className="text-[11px] font-normal py-0.5 px-2 bg-muted">
                                  {moduleName}
                                  {m.precio && Number(m.precio) > 0 && (
                                    <span className="ml-1 text-[10px] text-muted-foreground font-mono">
                                      ({currency.format(Number(m.precio))})
                                    </span>
                                  )}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Resumen Financiero del Contrato */}
                      <div className="flex items-center justify-between pt-3 border-t text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <PaymentIcon className="h-4 w-4" />
                          <span>{castPaymentType(contract.forma_pago)}</span>
                          {contract.periodicidad_cuota && (
                            <span className="capitalize text-muted-foreground">({contract.periodicidad_cuota})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">Monto Total</span>
                          <span className="text-base font-bold text-foreground">
                            {currency.format(Number(contract.total || 0))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: CRONOGRAMA DE PAGOS */}
        <TabsContent value="installments" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Cronograma de Pagos y Cuotas</h3>
              <p className="text-xs text-muted-foreground">
                Estado y vencimiento de cada una de tus cuotas de servicio.
              </p>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={installmentFilter === "todos" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setInstallmentFilter("todos")}
              >
                Todas ({installments.length})
              </Button>
              <Button
                variant={installmentFilter === "pendiente" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setInstallmentFilter("pendiente")}
              >
                Pendientes ({installments.filter((i) => i.situacion === "pendiente").length})
              </Button>
              <Button
                variant={installmentFilter === "vencido" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setInstallmentFilter("vencido")}
              >
                Vencidas ({installments.filter((i) => i.situacion === "vencido").length})
              </Button>
              <Button
                variant={installmentFilter === "pagado" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setInstallmentFilter("pagado")}
              >
                Pagadas ({installments.filter((i) => i.situacion === "pagado").length})
              </Button>
            </div>
          </div>

          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold text-xs">Contrato</TableHead>
                      <TableHead className="font-semibold text-xs">Vencimiento</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Monto Cuota</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Pagado</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Saldo Pendiente</TableHead>
                      <TableHead className="font-semibold text-xs text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                          No se encontraron cuotas para este filtro.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInstallments.map((item) => {
                        const variant = statusBadgeVariant[item.situacion] || {
                          bg: "bg-muted",
                          text: "text-muted-foreground",
                          border: "border-border",
                        };

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-xs">
                              {item.contrato?.numero || `ID #${item.contrato_id}`}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className="font-medium flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDisplayDate(item.fecha_vencimiento)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold">
                              {currency.format(Number(item.monto_total || 0))}
                            </TableCell>
                            <TableCell className="text-xs text-right text-emerald-600 dark:text-emerald-400 font-medium">
                              {currency.format(Number(item.monto_pagado || 0))}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold text-foreground">
                              {currency.format(Number(item.monto_pendiente || 0))}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[11px] capitalize font-medium px-2.5 py-0.5 ${variant.bg} ${variant.text} ${variant.border}`}
                              >
                                {item.situacion}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COMPROBANTES ELECTRÓNICOS */}
        <TabsContent value="invoices" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Comprobantes y Facturación</h3>
              <p className="text-xs text-muted-foreground">
                Descarga tus facturas, boletas, notas electrónicas, XML y CDR autorizados por SUNAT.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por N° o fecha..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold text-xs">Comprobante</TableHead>
                      <TableHead className="font-semibold text-xs">Fecha Emisión</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Monto Total</TableHead>
                      <TableHead className="font-semibold text-xs text-center">Estado SUNAT</TableHead>
                      <TableHead className="font-semibold text-xs text-right pr-6">Descargas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                          {invoiceSearch ? "No se encontraron comprobantes que coincidan con la búsqueda." : "No tienes comprobantes emitidos."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-bold text-xs text-primary">
                            {invoice.numero}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDisplayDate(invoice.fecha_emision)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {invoice.moneda} {Number(invoice.total || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-[11px] font-medium py-0.5 px-2">
                              {invoice.estado_label || "Emitido"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPdf(invoice.id)}
                                className="h-7 px-2.5 text-xs font-semibold gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>PDF</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(invoice, "xml")}
                                disabled={!invoice.xml_path}
                                className="h-7 px-2.5 text-xs gap-1"
                              >
                                <FileCode2 className="h-3.5 w-3.5" />
                                <span>XML</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(invoice, "cdr")}
                                disabled={!invoice.cdr_path}
                                className="h-7 px-2.5 text-xs gap-1"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>CDR</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  iconBg,
  progress,
  alert,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  gradient: string;
  iconColor: string;
  iconBg: string;
  progress?: number;
  alert?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden border bg-gradient-to-br ${gradient} shadow-xs`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{title}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</div>
          {subtitle && (
            <p className={`text-xs mt-1 font-medium ${alert ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {typeof progress === "number" && (
          <div className="space-y-1 pt-1">
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center bg-card/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm mt-1">{description}</p>
    </div>
  );
}
