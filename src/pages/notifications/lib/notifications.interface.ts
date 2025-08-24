// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
import { Mail } from "lucide-react";

export const NotificationsIcon = Mail;
export const NotificationsRoute = "/notificaciones";
export const NotificationsAddRoute = "/notificaciones/agregar";
export const NotificationsEditRoute = "/notificaciones/editar";
export const NotificationsIconName = "Mail";
export const NotificationsTitle = "Notificaciones";
export const NotificationsDescription = "Gestione el envio de las notificaciones por cliente.";
export const NotificationsDescriptionAdd =
  "Crea un nueva notificacion para el sistema.";
export const NotificationsDescriptionEdit =
  "Edita la notificacion del sistema.";

export interface NotificationsResponse {
  data: NotificationsResource[];
  links: Links;
  meta: Meta;
}

export interface NotificationsResource {
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

export interface NotificationsResourceById {
  status: number;
  message: string;
  data: NotificationsResource;
}
export interface getNotificationsProps {
  params?: Record<string, any>;
}
