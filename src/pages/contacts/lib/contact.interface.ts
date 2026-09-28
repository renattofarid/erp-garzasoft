import { Users } from "lucide-react";
import { Links, Meta } from "@/lib/pagination.interface";

export const ContactRoute = "/contactos";
export const ContactTitle = "Contactos";
export const ContactIcon = Users;
export const ContactIconName = "Users";
export const ContactDescription = "Gestiona los contactos registrados en el sistema.";

export interface ContactResource {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_tipo?: string;
  dni?: string;
  nombre: string;
  celular?: string;
  email?: string;
  es_dueno: boolean;
  es_vendedor: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactResponse {
  data: ContactResource[];
  links: Links | null;
  meta: Meta & { total: number };
}

export interface ContactDniLookupResult {
  status: number;
  source: "local" | "web_service" | "not_found" | "error";
  data?: {
    id: number | null;
    dni: string;
    nombre: string;
    celular: string | null;
    email: string | null;
    es_dueno: boolean;
    es_vendedor: boolean;
  };
  message?: string;
}

export interface GetContactProps {
  params?: Record<string, any>;
}
