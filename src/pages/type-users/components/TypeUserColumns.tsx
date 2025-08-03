"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTypeUser } from "../lib/typeUser.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { TypeUserResource } from "../lib/typeUser.interface";
import { useNavigate } from "react-router-dom";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { useTypeUsers } from "../lib/typeUser.hook";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { useState } from "react";

export type TypeUserColumns = ColumnDef<TypeUserResource>;

const handleDelelete = async (id: number, refetch: () => Promise<void>) => {
  try {
    await deleteTypeUser(id);
    refetch();
    successToast("Tipo de Usuario eliminado correctamente.");
  } catch (error) {
    errorToast("Error al eliminar el Tipo de Usuario.");
  }
};

export const typeUserColumns: TypeUserColumns[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Fecha de Actualización",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;
      const { refetch } = useTypeUsers();

      const [openDialog, setOpenDialog] = useState(false);

      return (
        <>
          <SelectActions>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router(`/tipo-usuarios/actualizar/${id}`)}
              >
                <Pencil className="size-5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>Permisos</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenDialog(true)}>
                <Trash2 className="size-5 text-destructive" />
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
