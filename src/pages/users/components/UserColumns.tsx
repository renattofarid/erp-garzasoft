"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        <TooltipProvider delayDuration={100} disableHoverableContent>
          <div className="flex items-center gap-1.5">
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Editar usuario"
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
                  aria-label="Eliminar usuario"
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
