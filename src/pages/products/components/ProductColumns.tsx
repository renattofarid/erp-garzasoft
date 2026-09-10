import { ColumnDef } from "@tanstack/react-table";
import { ProductResource, Modulo } from "../lib/product.interface";
import { FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import { PdfIcon } from "@/components/icons/DocumentIcons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <TooltipProvider delayDuration={100} disableHoverableContent>
          <div className="flex items-center gap-1.5">
            {/* 1. Formato de Alta (Verde) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#059669] hover:bg-[#047857] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Formato de alta"
                  onMouseLeave={(e) => e.currentTarget.blur()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onFormatoAlta(product);
                  }}
                >
                  <FileSpreadsheet className="size-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                Formato de Alta
              </TooltipContent>
            </Tooltip>

            {/* 2. Ver PDF Alta (Rojo) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Ver PDF de alta"
                  onMouseLeave={(e) => e.currentTarget.blur()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onPreviewPdf(id, product.nombre);
                  }}
                >
                  <PdfIcon className="size-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                Ver PDF Alta
              </TooltipContent>
            </Tooltip>

            {/* 3. Editar (Azul) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Editar producto"
                  onMouseLeave={(e) => e.currentTarget.blur()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onEdit(id);
                  }}
                >
                  <Pencil className="size-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                Editar
              </TooltipContent>
            </Tooltip>

            {/* 4. Eliminar (Rojo) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Eliminar producto"
                  onMouseLeave={(e) => e.currentTarget.blur()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onDelete(id);
                  }}
                >
                  <Trash2 className="size-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                Eliminar
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    },
  },
];
