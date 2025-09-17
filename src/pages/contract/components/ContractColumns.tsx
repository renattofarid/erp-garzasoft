import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import { ColumnDef } from "@tanstack/react-table";
import {
  ContractResource,
  ContractType,
  FormaPago,
} from "../lib/contract.interface.ts";
import { Modulo } from "../lib/contract.interface.ts";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { format, parse } from "date-fns";
import {
  castContractType,
  castPaymentType,
  getIconByContractType,
  getIconByPaymentType,
} from "../lib/contract.function.ts";

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
      return <Badge variant="outline">{`${fechaInicio} - ${fechaFin}`}</Badge>;
    },
  },
  {
    accessorKey: "cliente.razon_social",
    header: "Cliente",
  },
  {
    accessorKey: "tipo_contrato",
    header: "Tipo de Contrato",
    cell: ({ row }) => {
      const contractType = row.original.tipo_contrato as ContractType;
      const IconComponent = getIconByContractType(contractType);

      return (
        <Badge className="capitalize flex items-center gap-2" variant="default">
          {IconComponent && <IconComponent className="min-w-4 min-h-4" />}
          {castContractType(contractType)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "forma_pago",
    header: "Forma de Pago",
    cell: ({ row }) => {
      const typePayment = row.original.forma_pago as FormaPago;
      const IconComponent = getIconByPaymentType(typePayment);
      return (
        <Badge className="capitalize" variant="secondary">
          {IconComponent && <IconComponent className="min-w-4 min-h-4" />}
          {castPaymentType(typePayment)}
        </Badge>
      );
    },
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
      const overduePaymentCount = row.original.cuotas.filter(
        (cuota) => cuota.situacion === "vencido"
      ).length;

      return (
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router(`/contratos/editar/${id}`)}>
              Editar
            </DropdownMenuItem>
            {overduePaymentCount > 0 && (
              <DropdownMenuItem onSelect={() => onNotification(id)}>
                Notificar ({overduePaymentCount})
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
