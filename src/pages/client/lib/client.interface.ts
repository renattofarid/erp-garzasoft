// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Receipt } from "lucide-react";

export const ClientIcon = Receipt;
export const ClientRoute = "/clientes";
export const ClientAddRoute = "/clientes/agregar";
export const ClientEditRoute = "/clientes/editar";
export const ClientIconName = "Receipt";
export const ClientTitle = "Clientes";
export const ClientDescription = "Gestiona los clientes en el sistema.";
export const ClientDescriptionAdd = "Crea un nuevo cliente para el sistema.";
export const ClientDescriptionEdit =
  "Edita un cliente existente en el sistema.";

export interface ClientResponse {
  status: number;
  data: ClientResource[];
}

export interface ClientResource {
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
  deleted_at: string;
  contactos_clientes: ContactosCliente[];
  contratos: any[];
  sucursales_clientes: SucursalesCliente[];
  notificaciones: any[];
  avisos_saas: any[];
}

export interface ClientResourceById {
  status: number;
  message: string;
  data: ClientResource;
}

export interface getClientProps {
  params?: Record<string, any>;
}

export interface SucursalesCliente {
  id: number;
  cliente_id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ContactosCliente {
  id: number;
  cliente_id: number;
  nombre: string;
  celular: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
