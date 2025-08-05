// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingBag } from "lucide-react";

export const ProductIcon = ShoppingBag;
export const ProductRoute = "/productos";
export const ProductAddRoute = "/productos/agregar";
export const ProductEditRoute = "/productos/editar";
export const ProductIconName = "ShoppingBag";
export const ProductTitle = "Productos";
export const ProductDescription = "Gestiona los Prodcutos en el sistema.";
export const ProductDescriptionAdd =
  "Crea un nuevo producto para ofrecer a tus clientes.";
export const ProductDescriptionEdit =
  "Edita un producto existente para actualizar su información.";

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface ProductResource {
  id: number;
  nombre: string;
  descripcion: string;
  modulos: Modulo[];
  avisos_saas: any[];
  created_at: string;
  updated_at: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  precio_unitario: number;
  producto_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}

export interface ProductResourceById {
  status: number;
  message: string;
  data: ProductResource;
}
export interface getProductProps {
  params?: Record<string, any>;
}
