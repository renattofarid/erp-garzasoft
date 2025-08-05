"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { Badge } from "@/components/ui/badge";
import { UserResource } from "../lib/User.interface";

export type UserColumns = ColumnDef<UserResource>;

export const UserColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<UserResource>[] => [
  {
    accessorKey: "nombres",
    header: "Nombres",
    cell: ({ row }) => {
      const { nombres, apellidos } = row.original;
      return (
        <div className="text-sm">
          {nombres} {apellidos}
        </div>
      );
    },
  },

  {
    accessorKey: "rol",
    header: "Rol",
    cell: ({ row }) => {
      const rol = row.original.tipos_usuario;
      return (
        <div className=" text-sm">
          {rol && rol.nombre && (
            <Badge className="rounded-full">{rol.nombre}</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>Permisos</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
