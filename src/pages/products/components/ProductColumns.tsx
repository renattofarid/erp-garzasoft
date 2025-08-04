import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import { ProductResource } from "../lib/product.interface";
import { Modulo } from "../lib/product.interface";

export const ProductColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<ProductResource>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "modulos",
    header: "Módulos",
    cell: ({ getValue }) => {
      const sucursales = getValue() as Modulo[];
      return (
        <div className="space-y-1">
          {sucursales.map((contacto, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{contacto.nombre}</span>
            </div>
          ))}
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
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
