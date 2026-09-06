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
    header: "Nombre del Producto",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2.5">
          {product.logo ? (
            <img
              src={product.logo}
              alt={product.nombre}
              className="h-8 w-8 object-contain rounded-md border border-border/80 p-0.5 bg-background shadow-2xs shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              {product.nombre.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-2">
            {product.color && (
              <span
                className="h-3 w-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
                style={{ backgroundColor: product.color }}
                title={`Color: ${product.color}`}
              />
            )}
            <span className="font-semibold text-sm">{product.nombre}</span>
          </div>
        </div>
      );
    },
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
