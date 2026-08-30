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
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { format, parse } from "date-fns";
import {
  castContractType,
  castPaymentType,
  getIconByContractType,
  getIconByPaymentType,
} from "../lib/contract.function.ts";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";

function ContractActionsCell({
  contract,
  overduePaymentCount,
  onDelete,
  onNotification,
  onPreview,
  onDownloadWord,
  onViewInstallments,
  onSignature,
}: {
  contract: ContractResource;
  overduePaymentCount: number;
  onDelete: (id: number) => void;
  onNotification: (id: number) => void;
  onPreview: (id: number) => void;
  onDownloadWord: (id: number, numero?: string) => void;
  onViewInstallments: (contract: ContractResource) => void;
  onSignature: (contract: ContractResource) => void;
}) {
  const router = useNavigate();
  const id = contract.id;

  return (
    <SelectActions>
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router(`/contratos/editar/${id}`)}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSignature(contract)}>
          Firmar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onPreview(id)}>
          Ver PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDownloadWord(id, contract.numero)}>
          Descargar Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onViewInstallments(contract)}>
          Ver cuotas
        </DropdownMenuItem>
        {overduePaymentCount > 0 && (
          <DropdownMenuItem onSelect={() => onNotification(id)}>
            Notificar <Badge className="rounded-full">{overduePaymentCount}</Badge>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onDelete(id)}>
          Anular
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </SelectActions>
  );
}

export const ContractColumns = ({
  onDelete,
  onNotification,
  onPreview,
  onDownloadWord,
  onViewInstallments,
  onSignature,
}: {
  onDelete: (id: number) => void;
  onNotification: (id: number) => void;
  onPreview: (id: number) => void;
  onDownloadWord: (id: number, numero?: string) => void;
  onViewInstallments: (contract: ContractResource) => void;
  onSignature: (contract: ContractResource) => void;
}): ColumnDef<ContractResource>[] => [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const raw = row.original.created_at;
      if (!raw) return <span className="text-muted-foreground text-xs">-</span>;

      const dateObj = new Date(raw);
      if (isNaN(dateObj.getTime())) {
        return <span className="text-xs">{String(raw)}</span>;
      }

      const datePart = format(dateObj, "yyyy-MM-dd");
      const timePart = format(dateObj, "hh:mm:ss a");

      return (
        <div className="flex flex-col text-xs leading-tight font-medium">
          <span>{datePart}</span>
          <span className="text-muted-foreground text-[11px] font-normal">
            {timePart}
          </span>
        </div>
      );
    },
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
    cell: ({ row }) => getClientDisplayName(row.original.cliente),
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
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.estado === "anulado" ? "destructive" : "secondary"}>
        {row.original.estado === "anulado" ? "Anulado" : "Activo"}
      </Badge>
    ),
  },
  {
    accessorKey: "modulos",
    header: "Módulos",
    cell: ({ row }) => {
      const sucursales = row.original.contrato_producto_modulos;
      
      return (
        <div className="space-y-1">
          {sucursales?.map((contacto) => (
            <div key={contacto.id} className="text-sm">
              <span className="font-semibold">-{contacto.modulo?.nombre}</span>
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
      const overduePaymentCount = (row.original.cuotas || []).filter(
        (cuota) => cuota?.situacion === "vencido"
      ).length;

      return (
        <ContractActionsCell
          contract={row.original}
          overduePaymentCount={overduePaymentCount}
          onDelete={onDelete}
          onNotification={onNotification}
          onPreview={onPreview}
          onDownloadWord={onDownloadWord}
          onViewInstallments={onViewInstallments}
          onSignature={onSignature}
        />
      );
    },
  },
];
