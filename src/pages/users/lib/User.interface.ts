// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import { User } from "lucide-react";

export const UserIcon = User;
export const UserRoute = "/usuarios";
export const UserAddRoute = "/usuarios/agregar";
export const UserEditRoute = "/usuarios/editar";
export const UserIconName = "User";
export const UserTitle = "Usuarios";
export const UserDescription = "Gestiona los Usuarios en el sistema.";
export const UserDescriptionAdd =
  "Crea un nuevo tipo de usuario en el sistema.";
export const UserDescriptionEdit =
  "Edita un tipo de usuario existente para actualizar sus datos.";

export type UserResponse = UserResource[];

export interface UserResource {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_documento: string;
  numero_documento: string;
  telefono: string;
  tipo_usuario_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  tipos_usuario: TypeUserResource;
}

export interface getUserProps {
  params?: Record<string, any>;
}
