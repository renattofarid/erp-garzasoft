// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { PersonStanding } from "lucide-react";

export const TypeUserIcon = PersonStanding;
export const TypeUserRouter = "/tipo-usuarios";
export const TypeUserAddRouter = "/tipo-usuarios/agregar";
export const TypeUserEditRouter = "/tipo-usuarios/editar";
export const TypeUserIconName = "PersonStanding";
export const TypeUserTitle = "Tipos de Usuario";
export const TypeUserDescription =
  "Gestiona los tipos de usuario en el sistema.";
export const TypeUserDescriptionAdd =
  "Crea un nuevo tipo de usuario para gestionar los permisos y roles en el sistema.";
export const TypeUserDescriptionEdit =
  "Edita un tipo de usuario existente para actualizar sus permisos y roles.";

export interface TypeUserResponse {
  status: number;
  message: string;
  data: TypeUserResource[];
}

export interface TypeUserResource {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

export interface getTypeUserProps {
  params?: Record<string, any>;
}
