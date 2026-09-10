import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <TooltipProvider delayDuration={100} disableHoverableContent>
          <div className="flex items-center gap-1.5">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Editar tipo de local"
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

            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Eliminar tipo de local"
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
