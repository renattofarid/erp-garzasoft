import { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingBag } from "lucide-react";

export const ProductIcon = ShoppingBag;
export const ProductRoute = "/productos";
export const ProductAddRoute = "/productos/agregar";
export const ProductEditRoute = "/productos/editar";
export const ProductIconName = "ShoppingBag";
export const ProductTitle = "Productos y servicios";
export const ProductDescription = "Gestiona los productos y servicios en el sistema.";
export const ProductDescriptionAdd =
  "Crea un nuevo servicio o producto con sus conceptos.";
export const ProductDescriptionEdit =
  "Edita un servicio o producto existente.";

export type ProductType = "servicio" | "producto";

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface ProductResource {
  id: number;
  nombre: string;
  tipo: ProductType;
  descripcion: string | null;
  modulos: Modulo[];
  avisos_saas: any[];
  created_at: string;
  updated_at: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  precio_unitario: number;
  precio_mensual: number;
  precio_anual: number;
  producto_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  contratos: any[];
}

export interface ProductResourceById {
  status: number;
  message: string;
  data: ProductResource;
}

export interface getProductProps {
  params?: Record<string, any>;
}
