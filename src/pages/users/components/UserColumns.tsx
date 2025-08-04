"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IdCardIcon, Phone } from "lucide-react";
import { errorToast, successToast } from "@/lib/core.function";
import { useNavigate } from "react-router-dom";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { useState } from "react";
import { UserResource } from "../lib/User.interface";
import { deleteUser } from "../lib/User.actions";
import { useUsers } from "../lib/User.hook";
import { Badge } from "@/components/ui/badge";

export type UserColumns = ColumnDef<UserResource>;

const handleDelelete = async (id: number, refetch: () => Promise<void>) => {
  try {
    await deleteUser(id);
    refetch();
    successToast("Usuario eliminado correctamente.");
  } catch (error) {
    errorToast("Error al eliminar el Usuario.");
  }
};

export const UserColumns: UserColumns[] = [
  {
    id: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      const { usuario } = row.original;
      return (
        <div className="text-sm font-semibold">
          {usuario}
        </div>
      );
    },
  },
  {
    id: "nombres",
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
    id: "datos",
    header: "Datos",
    cell: ({ row }) => {
      const { tipo_documento, numero_documento, telefono } = row.original;
      return (
        <div className="text-sm">
          <div className="flex gap-2 items-center font-bold">
            <IdCardIcon className="w-5 h-5" />
            {tipo_documento}
          </div>
          <div className="ps-7 pb-2">{numero_documento}</div>
          <div className="flex gap-2 items-center font-bold">
            <Phone className="w-5 h-5" />
            {telefono}
          </div>
        </div>
      );
    },
  },
  {
    id: "rol",
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
      const router = useNavigate();
      const id = row.original.id;
      const { refetch } = useUsers();

      const [openDialog, setOpenDialog] = useState(false);

      return (
        <>
          <SelectActions>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router(`/usuarios/actualizar/${id}`)}
              >
                {/* <Pencil className="size-5" /> */}
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenDialog(true)}>
                {/* <Trash2 className="size-5 text-destructive" /> */}
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </SelectActions>

          <SimpleDeleteDialog
            onConfirm={() => handleDelelete(id, refetch)}
            open={openDialog}
            onOpenChange={setOpenDialog}
          />
        </>
      );
    },
  },
];
