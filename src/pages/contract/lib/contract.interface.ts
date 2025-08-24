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

export interface ContractResource {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero: string;
  tipo_contrato: string;
  total: string;
  forma_pago: string;
  cliente: Cliente;
  cuotas: any[];
  contrato_producto_modulos: ContratoProductoModulos[];
}

export interface Modulo {
  id: number;
  nombre: string;
  precio_unitario: number;
  contracto_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}

export interface ContractResourceById {
  status: number;
  message: string;
  data: ContractResource;
}
export interface getContractProps {
  params?: Record<string, any>;
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
  deleted_at?: any;
}

export interface ContratoProductoModulos {
  id: number;
  contrato_id: number;
  producto_id: number;
  modulo_id: number;
  precio: number;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
}
