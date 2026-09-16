"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
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
  PenTool,
  CreditCard,
  Award,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getComprobantePdf,
  getComprobantes,
} from "@/pages/invoicing/lib/invoicing.actions";
import { ComprobanteResource } from "@/pages/invoicing/lib/invoicing.interface";
import { ClientContractSignatureModal } from "./ClientContractSignatureModal";
import { ClientPaymentModal } from "./ClientPaymentModal";
import { format, parseISO } from "date-fns";
import { api } from "@/lib/config";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const statusBadgeVariant: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: {
    bg: "bg-amber-500/15 dark:bg-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/40",
  },
  vencido: {
    bg: "bg-rose-500/15 dark:bg-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/40",
  },
  pagado: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/40",
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

/** Helper para obtener nombre representativo del producto/servicio (Gesrest, HotelHUB, 360sys, etc.) */
function getContractProductName(contract: ContractResource): string {
  const modulos = contract.contrato_producto_modulos || [];
  const productNames = Array.from(
    new Set(
      modulos
        .map((m) => m.producto?.nombre || (m.producto as any)?.name)
        .filter(Boolean)
    )
  );

  if (productNames.length > 0) {
    return productNames.join(" + ");
  }

  if (contract.tipo_contrato === "saas") return "Gesrest / System SaaS";
  if (contract.tipo_contrato === "desarrollo") return "Desarrollo a Medida";
  if (contract.tipo_contrato === "soporte") return "Soporte Técnico";
  return "Servicio ERP Garzasoft";
}

export default function ClientPortalPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("installments");

  const [contracts, setContracts] = useState<ContractResource[]>([]);
  const [installments, setInstallments] = useState<CuentasPorCobrarResource[]>([]);
  const [invoices, setInvoices] = useState<ComprobanteResource[]>([]);

  // Filtros Pestaña Cronograma
  const [installmentContractFilter, setInstallmentContractFilter] = useState<string>("todos");
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState<"todos" | "pendiente" | "vencido" | "pagado">("todos");
  const [installmentDateFrom, setInstallmentDateFrom] = useState<string>("");
  const [installmentDateTo, setInstallmentDateTo] = useState<string>("");

  // Paginación Cronograma (20 en 20)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Filtros Pestaña Contratos
  const [contractNumberFilter, setContractNumberFilter] = useState<string>("");
  const [contractProductFilter, setContractProductFilter] = useState<string>("todos");
  const [contractDateFrom, setContractDateFrom] = useState<string>("");
  const [contractDateTo, setContractDateTo] = useState<string>("");

  // Modales
  const [selectedSignatureContract, setSelectedSignatureContract] = useState<ContractResource | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [selectedPayCuota, setSelectedPayCuota] = useState<CuentasPorCobrarResource | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchPortalData = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchPortalData();
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

  // Reset de Paginación al cambiar cualquier filtro de Cronograma
  useEffect(() => {
    setCurrentPage(1);
  }, [installmentStatusFilter, installmentContractFilter, installmentDateFrom, installmentDateTo]);

  // Filtrado de Cronograma
  const filteredInstallments = useMemo(() => {
    return installments.filter((item) => {
      // Filtro por Estado
      if (installmentStatusFilter !== "todos" && item.situacion !== installmentStatusFilter) {
        return false;
      }
      // Filtro por Contrato
      if (installmentContractFilter !== "todos") {
        const itemContractNum = item.contrato?.numero || `ID #${item.contrato_id}`;
        if (itemContractNum !== installmentContractFilter) return false;
      }
      // Filtro por Rango de Fechas de Vencimiento
      if (installmentDateFrom && item.fecha_vencimiento) {
        if (item.fecha_vencimiento < installmentDateFrom) return false;
      }
      if (installmentDateTo && item.fecha_vencimiento) {
        if (item.fecha_vencimiento > installmentDateTo) return false;
      }
      return true;
    });
  }, [installments, installmentStatusFilter, installmentContractFilter, installmentDateFrom, installmentDateTo]);

  // Items Paginados para la Tabla de Cronograma
  const totalPages = Math.ceil(filteredInstallments.length / pageSize) || 1;
  const paginatedInstallments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInstallments.slice(start, start + pageSize);
  }, [filteredInstallments, currentPage]);

  // Lista de Productos Únicos para el filtro de Contratos
  const availableProducts = useMemo(() => {
    const prodsMap = new Map<string, string>();
    contracts.forEach((c) => {
      (c.contrato_producto_modulos || []).forEach((cpm) => {
        const prodName = cpm.producto?.nombre || cpm.producto?.name;
        if (prodName) {
          prodsMap.set(prodName, prodName);
        }
      });
    });
    return Array.from(prodsMap.values());
  }, [contracts]);

  // Filtrado de Contratos
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Filtro por Número de Contrato
      if (contractNumberFilter.trim()) {
        const query = contractNumberFilter.toLowerCase();
        if (!contract.numero?.toLowerCase().includes(query)) return false;
      }
      // Filtro por Producto
      if (contractProductFilter !== "todos") {
        const hasProduct = (contract.contrato_producto_modulos || []).some((cpm) => {
          const name = cpm.producto?.nombre || cpm.producto?.name;
          return name === contractProductFilter;
        });
        if (!hasProduct) return false;
      }
      // Filtro por Fecha Inicio
      if (contractDateFrom && contract.fecha_inicio) {
        if (contract.fecha_inicio < contractDateFrom) return false;
      }
      if (contractDateTo && contract.fecha_inicio) {
        if (contract.fecha_inicio > contractDateTo) return false;
      }
      return true;
    });
  }, [contracts, contractNumberFilter, contractProductFilter, contractDateFrom, contractDateTo]);

  // Apertura del PDF de Factura
  const openInvoicePdf = async (cuota: CuentasPorCobrarResource) => {
    const invoiceId = cuota.comprobante?.id || (invoices.find((i) => i.numero && cuota.comprobante?.numero === i.numero)?.id);

    if (!invoiceId && !cuota.comprobante) {
      errorToast("Esta cuota aún no cuenta con una factura electrónica emitida.");
      return;
    }

    try {
      await openPdfFromFetcher(
        () => getComprobantePdf(invoiceId || cuota.comprobante!.id),
        "Generando factura en PDF..."
      );
    } catch (err: any) {
      errorToast(err.message || "No se pudo abrir el PDF del comprobante.");
    }
  };

  const openFormatoAltaPdf = async (productoId: number) => {
    try {
      const clienteId = user?.cliente_id || user?.cliente?.id;
      const url = `productos/${productoId}/formato-alta/pdf${clienteId ? `?cliente_id=${clienteId}` : ""}`;
      await openPdfFromFetcher(
        async () => {
          const res = await api.get(url, { responseType: "blob" });
          return res.data;
        },
        "Generando Formato de Alta..."
      );
    } catch {
      errorToast("No se pudo obtener el Formato de Alta.");
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
          subtitle="Consulta tu estado de cuenta, cronograma de deuda, facturas asociadas y firmas de contrato."
          icon="FolderOpen"
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Portal Seguro de Clientes
          </Badge>
        </div>
      </div>

      {/* PANEL 1 (ARRIBA): TARJETAS KPI CLICKABLES DE RESUMEN FINANCIERO */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryKpiCard
          title="Total Contratado"
          value={currency.format(totals.total)}
          subtitle={`${contracts.length} contrato${contracts.length !== 1 ? "s" : ""} activo${contracts.length !== 1 ? "s" : ""}`}
          icon={FolderOpen}
          gradient="from-blue-500/10 via-card to-card dark:from-blue-950/30 dark:via-zinc-900/90 dark:to-zinc-900/90"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-500/15 dark:bg-blue-500/20"
          onClick={() => {
            setActiveTab("installments");
            setInstallmentStatusFilter("todos");
          }}
        />

        <SummaryKpiCard
          title="Total Pagado"
          value={currency.format(totals.paid)}
          subtitle={`${percentPaid}% amortizado de la deuda`}
          icon={CheckCircle2}
          gradient="from-emerald-500/10 via-card to-card dark:from-emerald-950/30 dark:via-zinc-900/90 dark:to-zinc-900/90"
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-500/15 dark:bg-emerald-500/20"
          progress={percentPaid}
          onClick={() => {
            setActiveTab("installments");
            setInstallmentStatusFilter("pagado");
          }}
        />

        {/* CLICK EN SALDO PENDIENTE -> FILTRA CRONOGRAMA POR PENDIENTES */}
        <SummaryKpiCard
          title="Saldo Pendiente"
          value={currency.format(totals.pending)}
          subtitle={`${installments.filter((i) => i.situacion === "pendiente").length} cuotas por vencer (Clic para ver)`}
          icon={CalendarClock}
          gradient="from-amber-500/10 via-card to-card dark:from-amber-950/30 dark:via-zinc-900/90 dark:to-zinc-900/90"
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-500/15 dark:bg-amber-500/20"
          isActiveFilter={activeTab === "installments" && installmentStatusFilter === "pendiente"}
          onClick={() => {
            setActiveTab("installments");
            setInstallmentStatusFilter("pendiente");
          }}
        />

        {/* CLICK EN MONTO VENCIDO -> FILTRA CRONOGRAMA POR VENCIDAS */}
        <SummaryKpiCard
          title="Monto Vencido"
          value={currency.format(totals.overdue)}
          subtitle={
            totals.overdue > 0
              ? `${installments.filter((i) => i.situacion === "vencido").length} cuotas pendientes (Clic para ver)`
              : "Al día sin morosidad (Clic para ver)"
          }
          icon={ReceiptText}
          gradient={
            totals.overdue > 0
              ? "from-rose-500/15 via-card to-card dark:from-rose-950/30 dark:via-zinc-900/90 dark:to-zinc-900/90"
              : "from-emerald-500/10 via-card to-card dark:from-emerald-950/30 dark:via-zinc-900/90 dark:to-zinc-900/90"
          }
          iconColor={totals.overdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}
          iconBg={totals.overdue > 0 ? "bg-rose-500/20" : "bg-emerald-500/15 dark:bg-emerald-500/20"}
          alert={totals.overdue > 0}
          isActiveFilter={activeTab === "installments" && installmentStatusFilter === "vencido"}
          onClick={() => {
            setActiveTab("installments");
            setInstallmentStatusFilter("vencido");
          }}
        />
      </div>

      {/* PANEL 2 (CENTRO): PESTAÑAS PRINCIPALES */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl h-11 p-1 bg-muted/80 dark:bg-zinc-800/80 border border-border/50">
          <TabsTrigger value="installments" className="text-xs sm:text-sm font-bold gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <span>Cronograma ({installments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs sm:text-sm font-bold gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>Mis Contratos ({contracts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm font-bold gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span>Documentos</span>
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA 1: CRONOGRAMA DE PAGOS Y DEUDA CON PAGINACIÓN Y FACTURA ASOCIADA */}
        <TabsContent value="installments" className="space-y-4 outline-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card dark:bg-zinc-900/90 p-4 rounded-2xl border border-border/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                Cronograma de Pagos, Facturas y Deuda
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Revisa tus cuotas, la factura emitida asociada a cada una y su estado de vencimiento.
              </p>
            </div>

            {/* Filtros de Cronograma */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro por Contrato */}
              <div className="w-full sm:w-44">
                <Select
                  value={installmentContractFilter}
                  onValueChange={setInstallmentContractFilter}
                >
                  <SelectTrigger className="h-9 text-xs bg-background dark:bg-zinc-800 border-border">
                    <SelectValue placeholder="Todos los contratos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los contratos</SelectItem>
                    {Array.from(new Set(installments.map((i) => i.contrato?.numero || `ID #${i.contrato_id}`))).map(
                      (num) => (
                        <SelectItem key={num} value={num}>
                          {num}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Rango de Fechas */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Input
                  type="date"
                  value={installmentDateFrom}
                  onChange={(e) => setInstallmentDateFrom(e.target.value)}
                  className="h-9 text-xs bg-background dark:bg-zinc-800 border-border w-32"
                  title="Fecha vencimiento desde"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={installmentDateTo}
                  onChange={(e) => setInstallmentDateTo(e.target.value)}
                  className="h-9 text-xs bg-background dark:bg-zinc-800 border-border w-32"
                  title="Fecha vencimiento hasta"
                />
              </div>

              {/* Botón Limpiar */}
              {(installmentContractFilter !== "todos" || installmentStatusFilter !== "todos" || installmentDateFrom || installmentDateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInstallmentContractFilter("todos");
                    setInstallmentStatusFilter("todos");
                    setInstallmentDateFrom("");
                    setInstallmentDateTo("");
                  }}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros Rápidos por Estado */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={installmentStatusFilter === "todos" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl"
                onClick={() => setInstallmentStatusFilter("todos")}
              >
                Todas las cuotas ({installments.length})
              </Button>
              <Button
                variant={installmentStatusFilter === "pendiente" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl"
                onClick={() => setInstallmentStatusFilter("pendiente")}
              >
                Por Vencer / Pendientes ({installments.filter((i) => i.situacion === "pendiente").length})
              </Button>
              <Button
                variant={installmentStatusFilter === "vencido" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl"
                onClick={() => setInstallmentStatusFilter("vencido")}
              >
                Vencidas ({installments.filter((i) => i.situacion === "vencido").length})
              </Button>
              <Button
                variant={installmentStatusFilter === "pagado" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl"
                onClick={() => setInstallmentStatusFilter("pagado")}
              >
                Pagadas ({installments.filter((i) => i.situacion === "pagado").length})
              </Button>
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredInstallments.length} cuotas)
            </div>
          </div>

          {/* TABLA DE CRONOGRAMA */}
          <Card className="border-border/80 bg-card dark:bg-zinc-900/90 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60 dark:bg-zinc-800/60 hover:bg-muted/60">
                      <TableHead className="font-semibold text-xs text-foreground">Contrato</TableHead>
                      <TableHead className="font-semibold text-xs text-foreground">Factura / Comprobante</TableHead>
                      <TableHead className="font-semibold text-xs text-foreground">Vencimiento</TableHead>
                      <TableHead className="font-semibold text-xs text-right text-foreground">Monto Cuota</TableHead>
                      <TableHead className="font-semibold text-xs text-right text-foreground">Pagado</TableHead>
                      <TableHead className="font-semibold text-xs text-right text-foreground">Saldo Pendiente</TableHead>
                      <TableHead className="font-semibold text-xs text-center text-foreground">Estado</TableHead>
                      <TableHead className="font-semibold text-xs text-right pr-6 text-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInstallments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-sm">
                          No se encontraron cuotas para los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInstallments.map((item) => {
                        const variant = statusBadgeVariant[item.situacion] || {
                          bg: "bg-muted",
                          text: "text-muted-foreground",
                          border: "border-border",
                        };

                        const factura = item.comprobante;

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/30 dark:hover:bg-zinc-800/30">
                            {/* N° Contrato */}
                            <TableCell className="font-semibold text-xs text-foreground">
                              {item.contrato?.numero || `ID #${item.contrato_id}`}
                            </TableCell>

                            {/* FACTURA ASOCIADA A LA CUOTA */}
                            <TableCell className="text-xs">
                              {factura ? (
                                <Badge
                                  variant="outline"
                                  className="font-mono font-bold text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 gap-1 px-2 py-0.5"
                                >
                                  <Receipt className="h-3 w-3 text-sky-600" />
                                  <span>{factura.numero}</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 text-muted-foreground border-border">
                                  Sin Facturar
                                </Badge>
                              )}
                            </TableCell>

                            {/* Fecha Vencimiento */}
                            <TableCell className="text-xs">
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDisplayDate(item.fecha_vencimiento)}
                              </span>
                            </TableCell>

                            {/* Monto Cuota */}
                            <TableCell className="text-xs text-right font-semibold font-mono text-foreground">
                              {currency.format(Number(item.monto_total || 0))}
                            </TableCell>

                            {/* Monto Pagado */}
                            <TableCell className="text-xs text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                              {currency.format(Number(item.monto_pagado || 0))}
                            </TableCell>

                            {/* Saldo Pendiente */}
                            <TableCell className="text-xs text-right font-bold font-mono text-foreground">
                              {currency.format(Number(item.monto_pendiente || 0))}
                            </TableCell>

                            {/* Estado Cuota */}
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[11px] capitalize font-semibold px-2.5 py-0.5 ${variant.bg} ${variant.text} ${variant.border}`}
                              >
                                {item.situacion}
                              </Badge>
                            </TableCell>

                            {/* ACCIONES POR CUOTA: VER FACTURA Y PAGAR */}
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openInvoicePdf(item)}
                                  className={
                                    factura
                                      ? "h-7 px-2.5 text-xs font-semibold gap-1 border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10"
                                      : "h-7 px-2.5 text-xs font-semibold gap-1 text-muted-foreground opacity-70"
                                  }
                                  title={factura ? `Ver factura ${factura.numero}` : "Cuota sin factura emitida"}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>{factura ? `VER FACTURA` : `VER FACTURA`}</span>
                                </Button>

                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayCuota(item);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  disabled={item.situacion === "pagado"}
                                  className={
                                    item.situacion === "pagado"
                                      ? "h-7 px-2.5 text-xs font-semibold gap-1 opacity-50 cursor-not-allowed"
                                      : "h-7 px-2.5 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                  }
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  <span>{item.situacion === "pagado" ? "PAGADO" : "PAGAR"}</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* PAGINACIÓN DE 20 EN 20 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{(currentPage - 1) * pageSize + 1}</strong> a{" "}
                    <strong>{Math.min(currentPage * pageSize, filteredInstallments.length)}</strong> de{" "}
                    <strong>{filteredInstallments.length}</strong> cuotas
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2.5 text-xs font-semibold"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>

                    <div className="flex items-center gap-1 px-2 text-xs font-semibold">
                      <span>Página</span>
                      <span className="font-mono bg-background border px-2 py-0.5 rounded text-foreground">
                        {currentPage}
                      </span>
                      <span>de {totalPages}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="h-8 px-2.5 text-xs font-semibold"
                    >
                      Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PESTAÑA 2: CONTRATOS DEL CLIENTE CON NOMBRE DE PRODUCTO DESTACADO */}
        <TabsContent value="contracts" className="space-y-4 outline-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card dark:bg-zinc-900/90 p-4 rounded-2xl border border-border/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Mis Contratos y Servicios
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identifica el servicio contratado (Gesrest, HotelHUB, 360sys, etc.), descarga el contrato y gestiona tu firma.
              </p>
            </div>

            {/* Filtros de Contratos */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="N° contrato..."
                  value={contractNumberFilter}
                  onChange={(e) => setContractNumberFilter(e.target.value)}
                  className="pl-8 h-9 text-xs bg-background dark:bg-zinc-800 border-border"
                />
              </div>

              <div className="w-full sm:w-44">
                <Select value={contractProductFilter} onValueChange={setContractProductFilter}>
                  <SelectTrigger className="h-9 text-xs bg-background dark:bg-zinc-800 border-border">
                    <SelectValue placeholder="Todos los productos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los productos</SelectItem>
                    {availableProducts.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Input
                  type="date"
                  value={contractDateFrom}
                  onChange={(e) => setContractDateFrom(e.target.value)}
                  className="h-9 text-xs bg-background dark:bg-zinc-800 border-border w-32"
                  title="Fecha inicio desde"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={contractDateTo}
                  onChange={(e) => setContractDateTo(e.target.value)}
                  className="h-9 text-xs bg-background dark:bg-zinc-800 border-border w-32"
                  title="Fecha inicio hasta"
                />
              </div>

              {(contractNumberFilter || contractProductFilter !== "todos" || contractDateFrom || contractDateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setContractNumberFilter("");
                    setContractProductFilter("todos");
                    setContractDateFrom("");
                    setContractDateTo("");
                  }}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay contratos disponibles"
              description="No se encontraron contratos registrados o que coincidan con la búsqueda."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredContracts.map((contract) => {
                const ContractIcon = getIconByContractType(contract.tipo_contrato) || FileText;
                const PaymentIcon = getIconByPaymentType(contract.forma_pago) || ReceiptText;
                const modulos = contract.contrato_producto_modulos || [];
                const productName = getContractProductName(contract);

                const tieneFirmaArrendador = !!contract.firma_arrendador;
                const tieneFirmaCliente = !!contract.firma_cliente;

                return (
                  <Card key={contract.id} className="relative overflow-hidden border border-border/80 bg-card dark:bg-zinc-900/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                    <div>
                      <CardHeader className="pb-3 pt-5">
                        {/* ETIQUETA DESTACADA DEL PRODUCTO / SERVICIO (GESREST, HOTELHUB, 360SYS, ETC.) */}
                        <div className="mb-2">
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-extrabold uppercase tracking-wider px-3 py-1 gap-1.5 shadow-2xs">
                            <Layers className="h-3.5 w-3.5" />
                            <span>SERVICIO: {productName}</span>
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">
                              <ContractIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground flex-wrap">
                                <span>Contrato {contract.numero}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    contract.estado === "anulado"
                                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 text-[11px] uppercase font-bold tracking-wider px-2 py-0.5"
                                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] uppercase font-bold tracking-wider px-2 py-0.5"
                                  }
                                >
                                  {contract.estado === "anulado" ? "Anulado" : "Activo"}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-xs flex items-center gap-1.5 pt-1 text-muted-foreground flex-wrap">
                                <Badge variant="outline" className="text-[11px] font-medium capitalize bg-muted/60 dark:bg-zinc-800 border-border text-foreground/90">
                                  {castContractType(contract.tipo_contrato)}
                                </Badge>
                                <span>•</span>
                                <span className="capitalize font-medium text-foreground/80">{contract.vigencia_contrato || "Anual"}</span>
                              </CardDescription>
                            </div>
                          </div>

                          {/* ACCIONES DEL CONTRATO (VER PDF Y FIRMAR) */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openContractPdf(contract.id)}
                              className="h-8 gap-1.5 text-xs font-semibold shadow-xs border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver PDF</span>
                            </Button>

                            <Button
                              variant={tieneFirmaCliente ? "outline" : "default"}
                              size="sm"
                              onClick={() => {
                                setSelectedSignatureContract(contract);
                                setIsSignatureModalOpen(true);
                              }}
                              className={
                                tieneFirmaCliente
                                  ? "h-8 gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                                  : "h-8 gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs animate-pulse"
                              }
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              <span>{tieneFirmaCliente ? "Ver Firma" : "FIRMAR CONTRATO"}</span>
                            </Button>
                          </div>
                        </div>

                        {/* ESTADOS DE FIRMA DEL CONTRATO */}
                        <div className="flex items-center gap-2 pt-3 flex-wrap">
                          {tieneFirmaArrendador && tieneFirmaCliente ? (
                            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 text-[11px] font-semibold gap-1 px-2.5 py-0.5">
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                              Firmado por Garzasoft y Cliente
                            </Badge>
                          ) : tieneFirmaArrendador ? (
                            <Badge variant="outline" className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 text-[11px] font-semibold gap-1 px-2.5 py-0.5">
                              <CheckCircle className="h-3 w-3 text-indigo-600" />
                              Firmado por Garzasoft
                            </Badge>
                          ) : tieneFirmaCliente ? (
                            <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[11px] font-semibold gap-1 px-2.5 py-0.5">
                              <CheckCircle className="h-3 w-3 text-amber-600" />
                              Firmado por Cliente
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40 text-[11px] font-semibold gap-1 px-2.5 py-0.5">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              Pendiente de Firma Cliente
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-1">
                        {/* Fechas de Vigencia */}
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 dark:bg-zinc-800/60 border border-border/50 p-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-primary" /> Fecha Inicio
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatDisplayDate(contract.fecha_inicio)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" /> Fecha Vencimiento
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatDisplayDate(contract.fecha_fin)}
                            </span>
                          </div>
                        </div>

                        {/* Módulos y Productos Incluidos */}
                        {modulos.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                              <Package className="h-3.5 w-3.5 text-primary" />
                              <span>Módulos y Servicios Incluidos ({modulos.length}):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {modulos.map((m) => {
                                const moduleName = m.modulo?.nombre || (m.producto as any)?.nombre || m.producto?.name || `Módulo #${m.modulo_id}`;
                                const priceNum = Number(m.precio || 0);

                                return (
                                  <Badge
                                    key={m.id}
                                    variant="outline"
                                    className="text-xs font-medium py-1 px-2.5 bg-background dark:bg-zinc-800/90 border-border text-foreground dark:text-zinc-200 shadow-2xs flex items-center gap-1.5"
                                  >
                                    <span>{moduleName}</span>
                                    {priceNum > 0 ? (
                                      <span className="text-[11px] font-semibold text-primary font-mono bg-primary/10 dark:bg-primary/20 dark:text-primary-300 px-1.5 py-0.5 rounded">
                                        {currency.format(priceNum)}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground font-mono">
                                        (Incluido)
                                      </span>
                                    )}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <CardContent className="pt-0 pb-4">
                      {/* Resumen Financiero del Contrato */}
                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{castPaymentType(contract.forma_pago)}</span>
                          {contract.periodicidad_cuota && (
                            <span className="capitalize text-muted-foreground">({contract.periodicidad_cuota})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block font-medium">Monto Total</span>
                          <span className="text-base font-bold text-foreground font-mono">
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

        {/* PESTAÑA 3: DOCUMENTOS (DOCUMENTOS DE ALTA Y CERTIFICADO DIGITAL) */}
        <TabsContent value="documents" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card dark:bg-zinc-900/90 p-4 rounded-2xl border border-border/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Documentos de Alta y Servicios
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consulta y descarga tus documentos de alta de servicio, autorización de facturación electrónica y estado de tu certificado digital.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* DOCUMENTO DE ALTA DEL SERVICIO */}
            <Card className="border border-border/80 bg-card dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Documentos de Alta de Servicio</CardTitle>
                <CardDescription className="text-xs">
                  Formato oficial de alta y especificaciones técnicas de tus módulos y software contratado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pt-1">
                <div className="rounded-xl bg-muted/50 p-3 space-y-1.5 border border-border/50">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>Formato de Alta de Productos</span>
                    <Badge variant="secondary" className="text-[10px]">Autogenerado</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Documento de entrega con configuración inicial, usuarios principales y datos de soporte.
                  </p>
                </div>

                {contracts.map((c) => {
                  const firstProduct = c.contrato_producto_modulos?.[0]?.producto_id || 1;
                  const prodName = getContractProductName(c);
                  return (
                    <Button
                      key={c.id}
                      variant="outline"
                      size="sm"
                      onClick={() => openFormatoAltaPdf(firstProduct)}
                      className="w-full justify-between h-9 text-xs font-semibold border-border hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Alta {c.numero} ({prodName})</span>
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono shrink-0">PDF</Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* DOCUMENTO DE ALTA DE FACTURACIÓN ELECTRÓNICA */}
            <Card className="border border-border/80 bg-card dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Alta de Facturación Electrónica</CardTitle>
                <CardDescription className="text-xs">
                  Constancia de alta como emisor electrónico autorizada ante SUNAT.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pt-1">
                <div className="rounded-xl bg-emerald-500/10 p-3 space-y-1.5 border border-emerald-500/20">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <span>Estado Emisor SUNAT</span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">Habilitado</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Sistema homologado con envío automático de comprobantes (Facturas, Boletas, Notas).
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>RUC Emisor:</span>
                    <strong className="text-foreground font-mono">{cliente?.ruc || "20601799317"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span>Modo de Envío:</span>
                    <span className="text-foreground font-semibold">Producción / OSE - SUNAT</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openFormatoAltaPdf(1)}
                  className="w-full justify-between h-9 text-xs font-semibold border-border hover:bg-emerald-600 hover:text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Ver Ficha de Alta SUNAT
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">PDF</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* CERTIFICADO DIGITAL */}
            <Card className="border border-border/80 bg-card dark:bg-zinc-900/90 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">Certificado Digital</CardTitle>
                <CardDescription className="text-xs">
                  Vigencia y estado del certificado digital para la firma de XML SUNAT.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pt-1">
                <div className="rounded-xl bg-amber-500/10 p-3 space-y-1.5 border border-amber-500/20">
                  <div className="font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <span>Estado Certificado</span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">VÁLIDO Y ACTIVO</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Certificado de firma digital RSA 2048-bit registrado y homologado.
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" /> Fecha Vencimiento:
                    </span>
                    <strong className="text-foreground font-mono">31/12/2026</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Renovación:
                    </span>
                    <span className="text-emerald-600 font-semibold">Gestión Automática</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground text-center">
                  * Garzasoft gestiona la renovación preventiva de tu certificado digital antes de su vencimiento.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PANEL 3 (ABAJO): PERFIL Y DATOS DE LA EMPRESA */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card dark:bg-zinc-900/90 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {cliente?.razon_social || cliente?.nombre_comercial || "Mi Empresa"}
                </h2>
                {cliente?.tipo && (
                  <Badge variant="secondary" className="capitalize text-xs font-medium border border-border/60 bg-muted/80 text-foreground">
                    {cliente.tipo}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>RUC: <strong className="text-foreground font-mono">{cliente?.ruc || "No registrado"}</strong></span>
                {cliente?.nombre_comercial && cliente?.razon_social && (
                  <>
                    <span>•</span>
                    <span className="text-foreground/80">{cliente.nombre_comercial}</span>
                  </>
                )}
              </p>
              {cliente?.direccion && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-foreground/80">{cliente.direccion}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 border-border">
            {cliente?.dueno_celular && (
              <div className="flex items-center gap-2.5 bg-background dark:bg-zinc-800/70 rounded-xl px-3.5 py-2.5 border border-border/70 shadow-xs">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{cliente.dueno_celular}</div>
                  <div className="text-[10px] text-muted-foreground">Teléfono Contacto</div>
                </div>
              </div>
            )}
            {cliente?.dueno_email && (
              <div className="flex items-center gap-2.5 bg-background dark:bg-zinc-800/70 rounded-xl px-3.5 py-2.5 border border-border/70 shadow-xs">
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{cliente.dueno_email}</div>
                  <div className="text-[10px] text-muted-foreground">Email Notificaciones</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE FIRMA DIGITAL DEL CONTRATO */}
      <ClientContractSignatureModal
        open={isSignatureModalOpen}
        onOpenChange={setIsSignatureModalOpen}
        contract={selectedSignatureContract}
        onSuccess={fetchPortalData}
      />

      {/* MODAL DE PAGO DE CUOTA */}
      <ClientPaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        cuota={selectedPayCuota}
      />
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
  onClick,
  isActiveFilter,
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
  onClick?: () => void;
  isActiveFilter?: boolean;
}) {
  return (
    <Card
      onClick={onClick}
      className={`relative overflow-hidden border bg-gradient-to-br ${gradient} shadow-xs transition-all cursor-pointer hover:scale-[1.015] hover:shadow-md ${
        isActiveFilter ? "border-primary ring-2 ring-primary/30" : "border-border/80"
      }`}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{title}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">{value}</div>
          {subtitle && (
            <p className={`text-xs mt-1 font-medium ${alert ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {typeof progress === "number" && (
          <div className="space-y-1 pt-1">
            <Progress value={progress} className="h-1.5 bg-muted dark:bg-zinc-800" />
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-10 text-center bg-card/50 dark:bg-zinc-900/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm mt-1">{description}</p>
    </div>
  );
}
