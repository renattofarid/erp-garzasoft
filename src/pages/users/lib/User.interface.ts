// import { Links, Meta } from "@/src/shared/lib/pagination.interface";

import { Links, Meta } from "@/lib/pagination.interface";
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


export interface UserResponse {
  data: UserResource[];
  links: Links;
  meta: Meta;
}

export interface UserResource {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_usuario_id: number;
  tipos_usuario: TypeUserResource;
  password: string;
}
export interface UserResourceById {
  data: UserResource;
}

export interface getUserProps {
  params?: Record<string, any>;
}