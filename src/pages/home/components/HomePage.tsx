import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileWarning,
  ReceiptText,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { errorToast } from "@/lib/core.function";
import { getDashboardSummary } from "../lib/dashboard.actions";
import { DashboardResponse } from "../lib/dashboard.interface";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const dashboardChartConfig = {
  recaudacion: {
    label: "Recaudado",
    color: "#22c55e",
  },
  facturacion: {
    label: "Facturado",
    color: "#38bdf8",
  },
  total: {
    label: "Total",
    color: "#f59e0b",
  },
};

const pieColors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse["data"] | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then((response) => setDashboard(response.data))
      .catch(() => errorToast("No se pudo cargar el dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const kpis = dashboard?.kpis;

  const comparativoMensual = useMemo(() => {
    if (!dashboard) return [];

    const map = new Map<string, { label: string; recaudacion: number; facturacion: number }>();

    dashboard.series.recaudacion_mensual.forEach((item) => {
      map.set(item.periodo || item.label || "", {
        label: item.label || item.periodo || "",
        recaudacion: item.total || 0,
        facturacion: 0,
      });
    });

    dashboard.series.facturacion_mensual.forEach((item) => {
      const key = item.periodo || item.label || "";
      const current = map.get(key) || {
        label: item.label || key,
        recaudacion: 0,
        facturacion: 0,
      };
      current.facturacion = item.total || 0;
      map.set(key, current);
    });

    return Array.from(map.values());
  }, [dashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <TitleComponent
        title="Dashboard ejecutivo"
        subtitle="Visión comercial, cobranza y facturación de MrSoft."
        icon="LayoutGrid"
      >
        <div className="mt-3 flex w-full flex-wrap gap-2 md:mt-0 md:w-auto">
          <Button variant="outline" onClick={() => navigate("/facturacion")}>
            Ver facturación
          </Button>
          <Button onClick={() => navigate("/empresa-emisora")}>
            Configurar emisor
          </Button>
        </div>
      </TitleComponent>

      {!dashboard?.facturador.configurado && (
        <Card className="border-amber-400/50 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 size-5 text-amber-500 dark:text-amber-400" />
              <div>
                <div className="font-semibold text-amber-800 dark:text-amber-200">
                  Falta configurar el emisor electrónico de MrSoft
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-100/80">
                  Completa RUC, razón social y credenciales WSDL antes de emitir comprobantes reales.
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate("/empresa-emisora")}>
              Ir a configuración
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ingresos del mes"
          value={currency.format(kpis?.ingresos_mes || 0)}
          icon={BadgeDollarSign}
          hint="Cobranza registrada"
        />
        <KpiCard
          title="Facturado del mes"
          value={currency.format(kpis?.facturado_mes || 0)}
          icon={ReceiptText}
          hint="Comprobantes emitidos"
        />
        <KpiCard
          title="Por cobrar"
          value={currency.format(kpis?.por_cobrar || 0)}
          icon={CreditCard}
          hint={`${kpis?.cuotas_vencidas || 0} cuota(s) vencida(s)`}
        />
        <KpiCard
          title="Contratos activos"
          value={String(kpis?.contratos_activos || 0)}
          icon={BriefcaseBusiness}
          hint={`${kpis?.clientes_activos || 0} cliente(s) activos`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Facturación vs cobranza</CardTitle>
            <CardDescription>
              Últimos meses: compara lo emitido contra lo efectivamente cobrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer className="h-[310px] w-full min-w-0" config={dashboardChartConfig}>
              <LineChart data={comparativoMensual} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="facturacion"
                  stroke="var(--color-facturacion)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="recaudacion"
                  stroke="var(--color-recaudacion)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Salud operativa</CardTitle>
            <CardDescription>Indicadores que más suelen mirar gerencia y administración.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusRow
              label="Tasa de cobranza del mes"
              value={`${kpis?.tasa_cobranza || 0}%`}
              progress={Math.min(kpis?.tasa_cobranza || 0, 100)}
              colorClass="bg-emerald-500"
            />
            <StatusRow
              label="Comprobantes pendientes"
              value={String(kpis?.comprobantes_pendientes || 0)}
              progress={Math.min((kpis?.comprobantes_pendientes || 0) * 10, 100)}
              colorClass="bg-sky-500"
            />
            <StatusRow
              label="Comprobantes con error"
              value={String(kpis?.comprobantes_con_error || 0)}
              progress={Math.min((kpis?.comprobantes_con_error || 0) * 12, 100)}
              colorClass="bg-red-500"
            />

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">Emisor SUNAT</span>
                <Badge variant={dashboard?.facturador.configurado ? "default" : "destructive"}>
                  {dashboard?.facturador.configurado ? "Configurado" : "Pendiente"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {dashboard?.facturador.razon_social || "Sin razón social registrada"}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Modo: {dashboard?.facturador.modo || "-"}</span>
                <Button variant="ghost" size="sm" onClick={() => navigate("/empresa-emisora")}>
                  Editar <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr]">
        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Estado de comprobantes</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer className="h-[250px] w-full min-w-0" config={dashboardChartConfig}>
              <BarChart data={dashboard?.series.estado_comprobantes || []} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="estado" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--color-total)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Mix de clientes</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-hidden">
            <ChartContainer className="h-[250px] w-full min-w-0" config={dashboardChartConfig}>
              <PieChart>
                <Pie
                  data={dashboard?.series.tipos_cliente || []}
                  dataKey="total"
                  nameKey="tipo"
                  innerRadius={58}
                  outerRadius={88}
                >
                  {(dashboard?.series.tipos_cliente || []).map((entry, index) => (
                    <Cell key={entry.tipo || index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="tipo" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Radar comercial</CardTitle>
            <CardDescription>Lo más urgente para el dueño hoy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InsightItem
              icon={Activity}
              title="Pipeline operativo"
              value={`${kpis?.contratos_activos || 0} contratos activos`}
            />
            <InsightItem
              icon={Users}
              title="Base activa"
              value={`${kpis?.clientes_activos || 0} clientes con contratos vigentes`}
            />
            <InsightItem
              icon={FileWarning}
              title="Riesgo de facturación"
              value={`${kpis?.comprobantes_con_error || 0} comprobantes con error`}
            />
            <InsightItem
              icon={Building2}
              title="Emisor"
              value={dashboard?.facturador.configurado ? "Configurado" : "Pendiente de configurar"}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Próximas cuotas por vencer</CardTitle>
            <CardDescription>Próximos 30 días para anticipar cobranza.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.tablas.proximas_cuotas || []).length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No hay cuotas próximas registradas.
              </div>
            ) : (
              dashboard?.tablas.proximas_cuotas.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.cliente}</div>
                    <div className="break-words text-xs text-muted-foreground">
                      Contrato {item.contrato_numero} · vence {item.fecha_vencimiento}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={item.situacion === "vencido" ? "destructive" : "outline"}>
                      {item.situacion}
                    </Badge>
                    <span className="font-semibold">{currency.format(item.monto)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top clientes por facturación</CardTitle>
            <CardDescription>Clientes que más volumen mueven en comprobantes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(dashboard?.tablas.top_clientes || []).length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Aún no hay comprobantes suficientes para ranking.
              </div>
            ) : (
              dashboard?.tablas.top_clientes.map((item, index) => (
                <div key={item.cliente_id} className="min-w-0 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 break-words font-medium">{index + 1}. {item.cliente}</div>
                    <Badge variant="outline">{item.comprobantes} comp.</Badge>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>Total acumulado</span>
                    <span className="font-semibold text-foreground">{currency.format(item.total)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex items-start justify-between gap-3 py-6">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 break-words text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-2 break-words text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className="rounded-xl border border-border bg-primary/10 p-3">
          <Icon className="size-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  progress,
  colorClass,
}: {
  label: string;
  value: string;
  progress: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="min-w-0 break-words">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <Progress value={progress} className="[&_[data-slot=progress-indicator]]:bg-primary" />
      <div className={`hidden ${colorClass}`} />
    </div>
  );
}

function InsightItem({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="rounded-lg border border-border bg-primary/10 p-2">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
        <div className="break-words font-medium">{value}</div>
      </div>
    </div>
  );
}
