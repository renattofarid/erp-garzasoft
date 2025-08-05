// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
import { PersonStanding } from "lucide-react";

export const TypeUserIcon = PersonStanding;
export const TypeUserRoute = "/tipo-usuarios";
export const TypeUserAddRoute = "/tipo-usuarios/agregar";
export const TypeUserEditRoute = "/tipo-usuarios/editar";
export const TypeUserIconName = "PersonStanding";
export const TypeUserTitle = "Tipos de Usuario";
export const TypeUserDescription =
  "Gestiona los tipos de usuario en el sistema.";
export const TypeUserDescriptionAdd =
  "Crea un nuevo tipo de usuario para gestionar los permisos y roles en el sistema.";
export const TypeUserDescriptionEdit =
  "Edita un tipo de usuario existente para actualizar sus permisos y roles.";

export interface TypeUserResponse {
  data: TypeUserResource[];
  links: Links;
  meta: Meta;
}

export interface TypeUserResource {
  id: number;
  nombre: string;
}

export interface TypeUserResourceById {
  status: number;
  message: string;
  data: TypeUserResource;
}

export interface getTypeUserProps {
  params?: Record<string, any>;
}
