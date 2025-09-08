// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
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

export interface NotificationResponse {
  data: NotificationResource[];
  links: Links;
  meta: Meta;
}

export interface NotificationResource {
  id: number;
  contrato_id: number;
  detalle: string;
  created_at: string;
  updated_at: string;
  contrato: Contrato;
}

export interface Modulo {
  id: number;
  nombre: string;
  precio_unitario: number;
  notificationo_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}

export interface NotificationResourceById {
  status: number;
  message: string;
  data: NotificationResource;
}

interface Contrato {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  numero: string;
  tipo_contrato: string;
  total: string;
  forma_pago: string;
  cliente: Cliente;
  cuotas: any[];
  contrato_producto_modulos: Contratoproductomodulo[];
}

interface Contratoproductomodulo {
  id: number;
  contrato_id: number;
  producto_id: number;
  modulo_id: number;
  precio: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface Cliente {
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
  deleted_at: null;
}

export interface getNotificationProps {
  params?: Record<string, any>;
}
