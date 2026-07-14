import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { LocalTypeResource } from "../lib/localType.interface";

export const LocalTypeColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<LocalTypeResource>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Fecha de actualización",
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;

      if (!value) return <span className="text-muted-foreground">-</span>;

      const date = new Date(value);
      return (
        <span className="text-muted-foreground capitalize">
          {date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
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
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
