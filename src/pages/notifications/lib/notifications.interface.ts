// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
import { Cliente } from "@/pages/contract/lib/contract.interface";
import { Mail } from "lucide-react";

export const NotificationsIcon = Mail;
export const NotificationsRoute = "/notificaciones";
export const NotificationsAddRoute = "/notificaciones/agregar";
export const NotificationsEditRoute = "/notificaciones/editar";
export const NotificationsIconName = "Mail";
export const NotificationsTitle = "Notificaciones";
export const NotificationsDescription =
  "Gestione el envio de las notificaciones por cliente.";
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
  cliente_id: number;
  detalle: string;
  created_at: Date;
  updated_at: Date;
  cliente: Cliente;
}
export interface NotificationsResourceById {
  status: number;
  message: string;
  data: NotificationsResource;
}
export interface getNotificationsProps {
  params?: Record<string, any>;
}
