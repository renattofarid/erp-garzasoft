// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingBag } from "lucide-react";

export const ContractIcon = ShoppingBag;
export const ContractRoute = "/contratos";
export const ContractAddRoute = "/contratos/agregar";
export const ContractEditRoute = "/contratos/editar";
export const ContractIconName = "ShoppingBag";
export const ContractTitle = "Contratos";
export const ContractDescription = "Gestiona los Prodcutos en el sistema.";
export const ContractDescriptionAdd =
  "Crea un nuevo contrato para ofrecer a tus clientes.";
export const ContractDescriptionEdit =
  "Edita un contrato existente para actualizar su información.";

export interface ContractResponse {
  data: ContractResource[];
  links: Links;
  meta: Meta;
}

export interface ContractMutationResponse {
  status: number;
  message: string;
  data: ContractResource;
}

export type ContractType = "desarrollo" | "saas" | "soporte";
export type VigenciaContrato = "semestral" | "anual";
export type SituacionCuota = "pendiente" | "pagado" | "vencido";
export type FormaPago = "unico" | "parcial";
export type PeriodicidadCuota = "mensual" | "anual";
export type EstadoContrato = "activo" | "anulado";

export interface ContractResource {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero: string;
  tipo_contrato: ContractType;
  vigencia_contrato: VigenciaContrato;
  duracion_anios: number;
  total: string;
  forma_pago: FormaPago;
  estado: EstadoContrato;
  periodicidad_cuota?: PeriodicidadCuota | null;
  motivo_anulacion?: string | null;
  fecha_anulacion?: string | null;
  firma_arrendador?: string | null;
  firma_cliente?: string | null;
  created_at?: string;
  updated_at?: string;
  cliente: Cliente;
  cuotas: Cuota[];
  contrato_producto_modulos: ContratoProductoModulo[];
}

export interface Modulo {
  id: number;
  nombre: string;
  precio_unitario: number;
  precio_mensual?: number;
  precio_anual?: number;
  contracto_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: string;
}

export interface ContractResourceById {
  status: number;
  message: string;
  data: ContractResource;
}
export interface getContractProps {
  params?: Record<string, any>;
}

interface ContratoProductoModulo {
  id: number;
  contrato_id: number;
  producto_id: number;
  modulo_id: number;
  precio: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  producto: {
    name: string;
    id: number;
  };
  modulo: Modulo;
}

interface Cuota {
  id: number;
  contrato_id: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago?: string;
  situacion: SituacionCuota;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface Cliente {
  id: number;
  tipo: string;
  ruc: string | null;
  razon_social: string | null;
  nombre_comercial?: string | null;
  nombre_cliente?: string | null;
  dueno_nombre: string;
  dueno_celular: string | null;
  dueno_email: string | null;
  representante_nombre: string | null;
  representante_celular: string | null;
  representante_email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
