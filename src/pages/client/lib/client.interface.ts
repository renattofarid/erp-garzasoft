import { Links, Meta } from "@/lib/pagination.interface";
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

export type ClientTypeUi = "corporacion" | "empresa" | "local";
export type ClientTypeDb = ClientTypeUi | "unico";
export type LocalKind = string;

export interface ClientResponse {
  data: ClientResource[];
  links: Links;
  meta: Meta;
}

export interface ClientContact {
  dni?: string | null;
  nombre: string;
  celular?: string | null;
  email?: string | null;
  es_dueno?: boolean;
  es_vendedor?: boolean;
}

export interface ClientResource {
  id: number;
  parent_cliente_id?: number | null;
  tipo: ClientTypeDb;
  tipo_ui?: ClientTypeUi;
  ruc: string | null;
  razon_social: string | null;
  nombre_comercial: string | null;
  direccion?: string | null;
  tipos_local?: LocalKind[];
  nombre_cliente?: string | null;
  contacto_principal?: ClientContact | null;
  dueno_nombre: string | null;
  dueno_celular: string | null;
  dueno_email: string | null;
  dueno_es_representante?: boolean;
  dueno_es_responsable?: boolean;
  contacto_igual_empresa?: boolean;
  representante_nombre: string | null;
  representante_celular: string | null;
  representante_email: string | null;
  responsable_nombre?: string | null;
  responsable_celular?: string | null;
  responsable_email?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  contactos_clientes: ContactosCliente[];
  contratos: unknown[];
  sucursales_clientes: SucursalesCliente[];
  hijos_clientes: ClientResource[];
  notificaciones: unknown[];
  avisos_saas: unknown[];
}

export interface ClientLookupResponse {
  status: number;
  data: {
    ruc: string;
    razon_social: string | null;
    nombre_comercial: string | null;
    direccion?: string | null;
    estado?: string | null;
    condicion?: string | null;
    raw?: {
      code?: number;
      RUC?: string;
      RazonSocial?: string | null;
      Direccion?: string | null;
      Tipo?: string | null;
      Inscripcion?: string | null;
      [key: string]: unknown;
    };
  };
}

export interface ClientDniLookupResponse {
  status: number;
  data: {
    dni: string;
    nombres?: string | null;
    apepat?: string | null;
    apemat?: string | null;
    nombre_completo?: string | null;
    fechanac?: string | null;
    raw?: {
      code?: number;
      nombres?: string | null;
      apepat?: string | null;
      apemat?: string | null;
      fecnac?: string | null;
      [key: string]: unknown;
    };
  };
}

export interface ClientResourceById {
  status: number;
  message?: string;
  data: ClientResource;
}

export interface ClientPortalUser {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_usuario_id: number;
  deleted_at?: string | null;
}

export interface ClientPortalUserResponse {
  status: number;
  message?: string;
  data: {
    cliente_id: number;
    exists: boolean;
    usuario: ClientPortalUser | null;
    password_visible: string | null;
    password_message: string;
  };
}

export interface ClientPortalUserPayload {
  usuario: string;
  password?: string;
  nombres?: string;
  apellidos?: string;
}

export interface getClientProps {
  params?: Record<string, unknown>;
}

export interface ContactosCliente {
  id?: number;
  cliente_id?: number;
  dni?: string | null;
  nombre: string;
  celular?: string | null;
  email?: string | null;
  es_dueno?: boolean;
  es_vendedor?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SucursalesCliente {
  id?: number;
  cliente_id?: number;
  nombre: string;
  ruc?: string | null;
  razon_social?: string | null;
  nombre_comercial?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ClientFormNode {
  id: string;
  tipo: ClientTypeUi;
  ruc?: string;
  razon_social?: string;
  nombre_comercial?: string;
  direccion?: string;
  tipos_local?: LocalKind[];
  contacto: ClientContact;
  contactos: ClientContact[];
  contacto_igual_empresa?: boolean;
  hijos: ClientFormNode[];
}

export const createEmptyClientNode = (
  tipo: ClientTypeUi = "local"
): ClientFormNode => ({
  id: crypto.randomUUID(),
  tipo,
  ruc: "",
  razon_social: "",
  nombre_comercial: "",
  direccion: "",
  tipos_local: [],
  contacto: {
    dni: "",
    nombre: "",
    celular: "",
    email: "",
    es_dueno: false,
    es_vendedor: false,
  },
  contactos: [
    {
      dni: "",
      nombre: "",
      celular: "",
      email: "",
      es_dueno: false,
      es_vendedor: false,
    },
  ],
  contacto_igual_empresa: false,
  hijos: [],
});

export const getClientDisplayName = (
  client?:
    | Partial<ClientResource>
    | {
        tipo?: string | null;
        nombre_cliente?: string | null;
        razon_social?: string | null;
        nombre_comercial?: string | null;
        dueno_nombre?: string | null;
      }
    | null
) => {
  if (!client) return "Sin cliente";
  return (
    client.nombre_cliente ||
    client.razon_social ||
    client.nombre_comercial ||
    client.dueno_nombre ||
    "Sin cliente"
  );
};
