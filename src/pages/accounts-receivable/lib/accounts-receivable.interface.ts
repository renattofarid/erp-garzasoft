import { Links, Meta } from "@/lib/pagination.interface";
import { Calculator } from "lucide-react";

export const CuentasPorCobrarIcon = Calculator;
export const CuentasPorCobrarRoute = "/cuentas-por-cobrar";
export const CuentasPorCobrarAddRoute = "/cuentas-por-cobrar/agregar";
export const CuentasPorCobrarEditRoute = "/cuentas-por-cobrar/editar";
export const CuentasPorCobrarIconName = "Calculator";
export const CuentasPorCobrarTitle = "Cuentas por Cobrar";
export const CuentasPorCobrarDescription =
  "Gestiona las cuentas por cobrar del sistema.";
export const CuentasPorCobrarDescriptionAdd =
  "Crea una nueva cuenta por cobrar.";
export const CuentasPorCobrarDescriptionEdit =
  "Edita una cuenta por cobrar existente.";

export interface CuentasPorCobrarResponse {
  data: CuentasPorCobrarResource[];
  links: Links;
  meta: Meta;
}

export type SituacionCuota = "pendiente" | "pagado" | "vencido";

export interface CuentasPorCobrarResource {
  id: number;
  contrato_id: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  situacion: SituacionCuota;
  created_at: string;
  updated_at: string;
  contrato: Contrato;
  pagos_cuota?: PagoResource[]; // Para los pagos asociados
}

export interface Contrato {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero: string;
  cliente_id: number;
  tipo_contrato: string;
  total: string;
  forma_pago: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cliente: Cliente;
}

export interface Cliente {
  id: number;
  tipo: string;
  ruc: string;
  razon_social: string;
  dueno_nombre: string;
  dueno_celular: string;
  dueno_email: string;
  representante_nombre: string;
  representante_celular: string;
  representante_email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CuentasPorCobrarResourceById {
  status: number;
  message: string;
  data: CuentasPorCobrarResource;
}

export interface getCuentasPorCobrarProps {
  params?: Record<string, any>;
}

// Interface para pagos
export interface PagoResponse {
  data: PagoResource[];
  links: Links;
  meta: Meta;
}

export interface PagoResource {
  id: number;
  cuota_id: number;
  fecha_pago: string;
  monto_pagado: number;
  comprobante: string;
  created_at: string;
  updated_at: string;
}
