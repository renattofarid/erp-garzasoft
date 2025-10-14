import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import {
  CuentasPorCobrarResource,
  SituacionCuota,
} from "../lib/accounts-receivable.interface";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import {
  castSituacionCuota,
  getIconBySituacion,
  getSituacionVariant,
} from "../lib/accounts-receivable.functions";

export const CuentasPorCobrarColumns = ({
  onEdit,
  onDelete,
  onPay,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPay: (id: number) => void;
}): ColumnDef<CuentasPorCobrarResource>[] => [
  {
    accessorKey: "contrato.numero",
    header: "Número de Contrato",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "contrato.cliente.razon_social",
    header: "Cliente",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "monto",
    header: "Monto total",
    cell: ({ row }) => (
      <span className="font-semibold">S/. {Number(row.original.monto_total).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "monto_pagado",
    header: "Monto pagado",
    cell: ({ row }) => {
    
      return (
        <span className="font-semibold">S/. {row.original.monto_pagado.toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "monto_pendiente",
    header: "Monto pendiente",
    cell: ({ row }) => (
      <span className={`font-semibold ${row.original.monto_pendiente > 0 ? "text-red-500" : "text-green-500"}`}>
        S/. {row.original.monto_pendiente.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "fecha_vencimiento",
    header: "Fecha de Vencimiento",
    cell: ({ getValue }) => {
      const fecha = getValue() as string;
      return (
        <Badge variant="outline">
          {format(parse(fecha, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fecha_pago",
    header: "Fecha de Pago",
    cell: ({ getValue }) => {
      const fecha = getValue() as string | null;
      if (!fecha) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant="default">
          {format(parse(fecha, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "situacion",
    header: "Situación",
    cell: ({ getValue }) => {
      const situacion = getValue() as SituacionCuota;
      const IconComponent = getIconBySituacion(situacion);
      const variant = getSituacionVariant(situacion);

      return (
        <Badge variant={variant} className="flex items-center gap-2 w-fit">
          {IconComponent && <IconComponent className="w-4 h-4" />}
          {castSituacionCuota(situacion)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;
      const situacion = row.original.situacion;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            {/* {situacion === "pagado" && ( */}
            <DropdownMenuItem onClick={() => onEdit(id)}>
              {situacion === "pagado" ? "Ver Detalles" : "Editar Pago"}
            </DropdownMenuItem>
            {/* )
           } */}
            {situacion !== "pagado" && (
              <DropdownMenuItem onClick={() => onPay(id)}>
                Registrar Pago
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
