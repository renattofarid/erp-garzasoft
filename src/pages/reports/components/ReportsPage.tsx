import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers3,
  Loader2,
  RefreshCcw,
  Search,
  UsersRound,
} from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/lib/core.function";
import { downloadReportExcel, getReport, getReportOptions, openReportPdf } from "../lib/report.actions";
import type { ReportData, ReportFilters, ReportOptions, ReportType } from "../lib/report.interface";

const reportTypes: { id: ReportType; title: string; short: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "contratos_estado", title: "Estado de contratos", short: "Estado, situación e importes", icon: FileText },
  { id: "situacion_cuotas", title: "Situación de cuotas", short: "Pagadas, deuda y vencidas", icon: CircleDollarSign },
  { id: "contratos_servicio", title: "Por servicio", short: "Cantidad y total en soles", icon: FileSpreadsheet },
  { id: "contratos_modulo", title: "Por módulo", short: "Módulos, productos y montos", icon: Layers3 },
  { id: "listado_clientes", title: "Listado de clientes", short: "Servicios, módulos y deudores", icon: UsersRound },
  { id: "fechas_contrato", title: "Fechas de contratos", short: "Emisión y vencimiento", icon: CalendarRange },
];

const initialFilters: ReportFilters = { campo_fecha: "emision" };
const validTypes = new Set<ReportType>(reportTypes.map((item) => item.id));
const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const number = new Intl.NumberFormat("es-PE");
const pageSize = 15;

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryType = searchParams.get("tipo") as ReportType | null;
  const [type, setType] = useState<ReportType>(queryType && validTypes.has(queryType) ? queryType : "contratos_estado");
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(initialFilters);
  const [options, setOptions] = useState<ReportOptions | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getReportOptions().then(setOptions).catch(() => errorToast("No se pudieron cargar las opciones de reportes."));
  }, []);

  useEffect(() => {
    if (queryType && validTypes.has(queryType) && queryType !== type) setType(queryType);
  }, [queryType, type]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    getReport(type, appliedFilters)
      .then(setReport)
      .catch(() => errorToast("No se pudo generar el reporte."))
      .finally(() => setLoading(false));
  }, [type, appliedFilters]);

  const pageCount = Math.max(1, Math.ceil((report?.rows.length || 0) / pageSize));
  const visibleRows = useMemo(() => report?.rows.slice((page - 1) * pageSize, page * pageSize) || [], [report, page]);
  const availableModules = useMemo(
    () => options?.modulos.filter((item) => !filters.producto_id || String(item.producto_id) === filters.producto_id) || [],
    [options, filters.producto_id]
  );

  const update = (key: keyof ReportFilters, value: string | boolean) =>
    setFilters((current) => ({ ...current, [key]: value, ...(key === "producto_id" ? { modulo_id: "" } : {}) }));

  const apply = () => setAppliedFilters({ ...filters });
  const clear = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const selectType = (nextType: ReportType) => {
    setType(nextType);
    setSearchParams({ tipo: nextType });
  };

  const exportFile = async (format: "excel" | "pdf") => {
    if (!report) return;
    setExporting(format);
    try {
      if (format === "excel") {
        await downloadReportExcel(type, appliedFilters, report.title);
        successToast("Excel generado correctamente.");
      } else {
        await openReportPdf(type, appliedFilters);
      }
    } catch {
      errorToast(`No se pudo generar el ${format === "excel" ? "Excel" : "PDF"}.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <TitleComponent title="Centro de reportes" subtitle="Información gerencial filtrable y exportable con presentación profesional." icon="ChartNoAxesCombined">
        <div className="mt-3 flex w-full flex-wrap gap-2 md:mt-0 md:w-auto">
          <Button variant="outline" disabled={!report || exporting !== null} onClick={() => exportFile("pdf")}>
            {exporting === "pdf" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileText className="mr-2 size-4" />} Ver PDF
          </Button>
          <Button disabled={!report || exporting !== null} onClick={() => exportFile("excel")} className="bg-emerald-600 hover:bg-emerald-700">
            {exporting === "excel" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />} Descargar Excel
          </Button>
        </div>
      </TitleComponent>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {reportTypes.map((item) => {
          const Icon = item.icon;
          const active = item.id === type;
          return (
            <button key={item.id} onClick={() => selectType(item.id)} className={`rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"}`}>
              <Icon className={`mb-3 size-5 ${active ? "text-white" : "text-primary"}`} />
              <div className="text-sm font-semibold">{item.title}</div>
              <div className={`mt-1 text-xs ${active ? "text-white/75" : "text-muted-foreground"}`}>{item.short}</div>
            </button>
          );
        })}
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Filter className="size-4 text-primary" /> Filtros del reporte</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Buscar cliente, RUC o contrato">
              <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={filters.buscar || ""} onChange={(event) => update("buscar", event.target.value)} onKeyDown={(event) => event.key === "Enter" && apply()} placeholder="Escriba para buscar..." className="pl-9" /></div>
            </Field>
            <Field label="Campo de fecha">
              {type === "situacion_cuotas" ? (
                <select disabled className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"><option>Vencimiento de la cuota</option></select>
              ) : (
                <Select value={filters.campo_fecha || "emision"} onChange={(value) => update("campo_fecha", value)} options={[{ value: "emision", label: "Fecha de emisión" }, { value: "inicio", label: "Fecha de inicio" }, { value: "vencimiento", label: "Fecha de vencimiento" }]} />
              )}
            </Field>
            <Field label="Desde"><Input type="date" value={filters.fecha_desde || ""} onChange={(event) => update("fecha_desde", event.target.value)} /></Field>
            <Field label="Hasta"><Input type="date" value={filters.fecha_hasta || ""} onChange={(event) => update("fecha_hasta", event.target.value)} /></Field>
            <Field label="Estado del contrato"><Select value={filters.estado || ""} onChange={(value) => update("estado", value)} placeholder="Todos los estados" options={(options?.estados_contrato || []).map((value) => ({ value, label: label(value) }))} /></Field>
            <Field label="Servicio"><Select value={filters.servicio || ""} onChange={(value) => update("servicio", value)} placeholder="Todos los servicios" options={(options?.servicios || []).map((value) => ({ value, label: label(value) }))} /></Field>
            <Field label="Producto"><Select value={filters.producto_id || ""} onChange={(value) => update("producto_id", value)} placeholder="Todos los productos" options={(options?.productos || []).map((item) => ({ value: String(item.id), label: item.nombre }))} /></Field>
            <Field label="Módulo"><Select value={filters.modulo_id || ""} onChange={(value) => update("modulo_id", value)} placeholder="Todos los módulos" options={availableModules.map((item) => ({ value: String(item.id), label: item.nombre }))} /></Field>
            {type === "situacion_cuotas" && <Field label="Situación de cuota"><Select value={filters.situacion || ""} onChange={(value) => update("situacion", value)} placeholder="Todas las situaciones" options={(options?.situaciones_cuota || []).map((value) => ({ value, label: label(value) }))} /></Field>}
            {type === "listado_clientes" && <label className="flex h-10 items-center gap-3 self-end rounded-md border border-border px-3 text-sm"><input type="checkbox" checked={Boolean(filters.solo_deudores)} onChange={(event) => update("solo_deudores", event.target.checked)} className="size-4 accent-primary" /> Mostrar solo deudores</label>}
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={clear}><RefreshCcw className="mr-2 size-4" /> Limpiar</Button>
            <Button onClick={apply}><Filter className="mr-2 size-4" /> Aplicar filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Report content — kept mounted while loading to avoid flicker */}
      {!report && loading ? (
        // Only show full-page spinner on the very first load (no data yet)
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed">
          <Loader2 className="mr-3 size-5 animate-spin text-primary" /> Generando reporte...
        </div>
      ) : report && (
        <div className="relative">
          {/* Subtle overlay while refreshing — keeps old data readable */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-background/60 backdrop-blur-[1px] pt-16 pointer-events-none">
              <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-md text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />
                Actualizando...
              </div>
            </div>
          )}

          <div className={`space-y-4 transition-opacity duration-150 ${loading ? "opacity-60" : "opacity-100"}`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(report.summary).map(([key, value]) => <SummaryCard key={key} label={label(key)} value={formatSummary(key, value)} />)}
            </div>
            <Card className="min-w-0 overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b bg-muted/20 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><CardTitle className="text-lg">{report.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{report.description}</p></div>
                  <Badge variant="outline">{number.format(report.rows.length)} registro(s)</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead><tr className="border-b bg-primary/[0.06]">{report.columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">{column}</th>)}</tr></thead>
                    <tbody>
                      {visibleRows.length ? visibleRows.map((row, rowIndex) => (
                        <tr key={`${page}-${rowIndex}`} className="border-b transition-colors hover:bg-muted/35">
                          {row.map((cell, index) => <td key={index} className={`max-w-[320px] px-4 py-3 align-top ${report.currencyColumns.includes(index) ? "whitespace-nowrap text-right font-medium tabular-nums" : "break-words"}`}>{report.currencyColumns.includes(index) ? money.format(Number(cell || 0)) : cell || "—"}</td>)}
                        </tr>
                      )) : <tr><td colSpan={report.columns.length} className="p-12 text-center text-muted-foreground">No hay registros para los filtros seleccionados.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <span>Página {page} de {pageCount} · Mostrando {visibleRows.length} de {report.rows.length}</span>
                  <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /></Button><Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4" /></Button></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


function Field({ label: fieldLabel, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{fieldLabel}</span>{children}</label>;
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">{placeholder || "Seleccione"}</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>;
}

function SummaryCard({ label: cardLabel, value }: { label: string; value: string }) {
  return <Card className="overflow-hidden border-border/80"><CardContent className="relative p-5"><div className="absolute inset-y-0 left-0 w-1 bg-primary" /><div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{cardLabel}</div><div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div></CardContent></Card>;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSummary(key: string, value: string | number) {
  return ["total", "deuda", "pagado"].includes(key) ? money.format(Number(value)) : number.format(Number(value));
}
