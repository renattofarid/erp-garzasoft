import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import { ProductResource, Modulo } from "../lib/product.interface";
import { Edit, Eye, FileSpreadsheet, Trash2 } from "lucide-react";

export const ProductColumns = ({
  onEdit,
  onDelete,
  onFormatoAlta,
  onPreviewPdf,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onFormatoAlta: (product: ProductResource) => void;
  onPreviewPdf: (id: number, nombre: string) => void;
}): ColumnDef<ProductResource>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ getValue }) => (
      <span className="capitalize">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ getValue }) => (
      <span className="font-medium text-muted-foreground">{getValue() as string || "-"}</span>
    ),
  },
  {
    accessorKey: "modulos",
    header: "Conceptos",
    cell: ({ getValue }) => {
      const conceptos = getValue() as Modulo[];
      return (
        <div className="space-y-1">
          {conceptos.map((concepto, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{concepto.nombre}</span>
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
      const product = row.original;
      const id = product.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onFormatoAlta(product)} className="gap-2 cursor-pointer font-medium">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>Formato de Alta</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreviewPdf(id, product.nombre)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>Ver PDF Alta</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(id)} className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
