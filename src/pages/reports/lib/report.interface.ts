export type ReportType =
  | "contratos_estado"
  | "situacion_cuotas"
  | "contratos_servicio"
  | "contratos_modulo"
  | "listado_clientes"
  | "fechas_contrato";

export interface ReportFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  campo_fecha?: "emision" | "inicio" | "vencimiento";
  estado?: string;
  situacion?: string;
  servicio?: string;
  producto_id?: string;
  modulo_id?: string;
  solo_deudores?: boolean;
  buscar?: string;
}

export interface ReportData {
  title: string;
  description: string;
  columns: string[];
  rows: (string | number | null)[][];
  summary: Record<string, string | number>;
  currencyColumns: number[];
  generated_at: string;
}

export interface ReportOptions {
  productos: { id: number; nombre: string }[];
  modulos: { id: number; nombre: string; producto_id: number }[];
  servicios: string[];
  estados_contrato: string[];
  situaciones_cuota: string[];
}
