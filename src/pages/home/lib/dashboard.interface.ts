export interface DashboardKpis {
  ingresos_mes: number;
  facturado_mes: number;
  por_cobrar: number;
  contratos_activos: number;
  clientes_activos: number;
  cuotas_vencidas: number;
  comprobantes_pendientes: number;
  comprobantes_con_error: number;
  tasa_cobranza: number;
}

export interface DashboardSeriesItem {
  periodo?: string;
  label?: string;
  total?: number;
  estado?: string;
  tipo?: string;
}

export interface DashboardUpcomingQuota {
  id: number;
  contrato_numero: string;
  cliente: string;
  fecha_vencimiento: string;
  monto: number;
  situacion: string;
}

export interface DashboardTopClient {
  cliente_id: number;
  cliente: string;
  total: number;
  comprobantes: number;
}

export interface DashboardFacturador {
  configurado: boolean;
  empresa_id?: string | null;
  modo?: "simulacion" | "produccion" | null;
  ruc?: string | null;
  razon_social?: string | null;
  nombre_comercial?: string | null;
  activo: boolean;
}

export interface DashboardResponse {
  status: number;
  data: {
    kpis: DashboardKpis;
    series: {
      recaudacion_mensual: DashboardSeriesItem[];
      facturacion_mensual: DashboardSeriesItem[];
      estado_comprobantes: DashboardSeriesItem[];
      tipos_cliente: DashboardSeriesItem[];
    };
    tablas: {
      proximas_cuotas: DashboardUpcomingQuota[];
      top_clientes: DashboardTopClient[];
    };
    facturador: DashboardFacturador;
  };
}
