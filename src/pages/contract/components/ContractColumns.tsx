import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import { ContractResource } from "../lib/contract.interface.ts";
import { Modulo } from "../lib/contract.interface.ts";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { format, parse } from "date-fns";

export const ContractColumns = ({
  onDelete,
  onNotification,
}: {
  onDelete: (id: number) => void;
  onNotification: (id: number) => void;
}): ColumnDef<ContractResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "vigencia",
    header: "Fecha Vigencia",
    cell: ({ row }) => {
      const fechaInicio = format(
        parse(
          row.original.fecha_inicio.split("T").shift() || "",
          "yyyy-MM-dd",
          new Date()
        ),
        "dd/MM/yyyy"
      );
      const fechaFin = format(
        parse(
          row.original.fecha_fin.split("T").shift() || "",
          "yyyy-MM-dd",
          new Date()
        ),
        "dd/MM/yyyy"
      );
      return <Badge>{`${fechaInicio} - ${fechaFin}`}</Badge>;
    },
  },
  {
    accessorKey: "cliente.razon_social",
    header: "Cliente",
  },
  {
    accessorKey: "tipo_contrato",
    header: "Tipo de Contrato",
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
      const router = useNavigate();
      const id = row.original.id;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router(`/contratos/editar/${id}`)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onNotification(id)}>
              Notificar
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
