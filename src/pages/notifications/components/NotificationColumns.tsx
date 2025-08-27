import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import { NotificationsResource } from "../lib/notifications.interface";

export const NotificationColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): ColumnDef<NotificationsResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },

 {
    accessorKey: "cliente.nombre",
    header: "Cliente",
    cell: ({ row }) => <span>{row.original.cliente?.dueno_nombre}</span>,
  },

  {
    accessorKey: "cliente.correo",
    header: "Correo",
    cell: ({ row }) => <span>{row.original.cliente?.dueno_email}</span>,
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router(`/contratos/editar/${id}`)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
