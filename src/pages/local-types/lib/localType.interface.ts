import { Links, Meta } from "@/lib/pagination.interface";
import { Store } from "lucide-react";

export const LocalTypeIcon = Store;
export const LocalTypeRoute = "/tipos-local";
export const LocalTypeAddRoute = "/tipos-local/agregar";
export const LocalTypeEditRoute = "/tipos-local/editar";
export const LocalTypeIconName = "Store";
export const LocalTypeTitle = "Tipos de local";
export const LocalTypeDescription =
  "Gestiona los tipos de local disponibles para clientes y contratos.";
export const LocalTypeDescriptionAdd =
  "Crea un nuevo tipo de local para usarlo en el registro de clientes.";
export const LocalTypeDescriptionEdit =
  "Edita un tipo de local existente del catálogo.";

export interface LocalTypeResponse {
  data: LocalTypeResource[];
  links: Links | null;
  meta: Meta & {
    total: number;
  };
}

export interface LocalTypeResource {
  id: number;
  nombre: string;
  codigo: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocalTypeResourceById {
  status: number;
  message?: string;
  data: LocalTypeResource;
}

export interface GetLocalTypeProps {
  params?: Record<string, any>;
}
