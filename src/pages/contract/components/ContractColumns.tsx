import { ColumnDef } from "@tanstack/react-table";
import {
  ContractResource,
  ContractType,
  FormaPago,
} from "../lib/contract.interface.ts";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bell,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Pencil,
  PenTool,
  Trash2,
} from "lucide-react";
import { PdfIcon } from "@/components/icons/DocumentIcons";
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
  onGenerateActa,
}: {
  contract: ContractResource;
  overduePaymentCount: number;
  onDelete: (contract: ContractResource) => void;
  onNotification: (id: number) => void;
  onPreview: (id: number) => void;
  onDownloadWord: (id: number, numero?: string) => void;
  onViewInstallments: (contract: ContractResource) => void;
  onSignature: (contract: ContractResource) => void;
  onGenerateActa?: (contract: ContractResource) => void;
}) {
  const router = useNavigate();
  const id = contract.id;
  const isAnulado = contract.estado === "anulado";

  return (
    <TooltipProvider delayDuration={100} disableHoverableContent>
      <div className="flex items-center gap-1.5 flex-wrap max-w-[280px]">
        {/* 1. Ver PDF (Rojo) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label="Ver PDF del contrato"
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                onPreview(id);
              }}
            >
              <PdfIcon className="size-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            Ver PDF
          </TooltipContent>
        </Tooltip>

        {/* 2. Descargar Word (Azul Marino) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label="Descargar Word (.docx)"
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                onDownloadWord(id, contract.numero);
              }}
            >
              <FileText className="size-4 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            Descargar Word (.docx)
          </TooltipContent>
        </Tooltip>

        {/* 3. Firmar (Púrpura) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#8E24AA] hover:bg-[#7B1FA2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label="Firmar contrato"
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                onSignature(contract);
              }}
            >
              <PenTool className="size-4 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            Firmar
          </TooltipContent>
        </Tooltip>

        {/* 4. Ver Cuotas (Cyan) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#00ACC1] hover:bg-[#0097A7] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label="Ver cuotas del contrato"
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                onViewInstallments(contract);
              }}
            >
              <CalendarDays className="size-4 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            Ver cuotas
          </TooltipContent>
        </Tooltip>

        {/* 5. Notificar Vencidos (Ámbar) */}
        {overduePaymentCount > 0 && (
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="size-8 rounded-full bg-[#FFA000] hover:bg-[#FF8F00] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0 relative"
                aria-label={`Notificar ${overduePaymentCount} cuotas vencidas`}
                onMouseLeave={(e) => e.currentTarget.blur()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onNotification(id);
                }}
              >
                <Bell className="size-4 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold size-4 rounded-full flex items-center justify-center border border-white">
                  {overduePaymentCount}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
              Notificar ({overduePaymentCount} vencidas)
            </TooltipContent>
          </Tooltip>
        )}

        {/* 6. Formato de Alta (Verde) */}
        {onGenerateActa && (
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="size-8 rounded-full bg-[#059669] hover:bg-[#047857] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                aria-label="Acta / Formato de Alta"
                onMouseLeave={(e) => e.currentTarget.blur()}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onGenerateActa(contract);
                }}
              >
                <FileSpreadsheet className="size-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
              Acta / Formato de Alta
            </TooltipContent>
          </Tooltip>
        )}

        {/* 7. Editar (Azul) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label="Editar contrato"
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                router(`/contratos/editar/${id}`);
              }}
            >
              <Pencil className="size-4 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            Editar
          </TooltipContent>
        </Tooltip>

        {/* 8. Anular / Eliminar (Rojo) */}
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
              aria-label={isAnulado ? "Eliminar contrato" : "Anular contrato"}
              onMouseLeave={(e) => e.currentTarget.blur()}
              onClick={(e) => {
                e.currentTarget.blur();
                onDelete(contract);
              }}
            >
              <Trash2 className="size-4 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
            {isAnulado ? "Eliminar" : "Anular"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const ContractColumns = ({
  onDelete,
  onNotification,
  onPreview,
  onDownloadWord,
  onViewInstallments,
  onSignature,
  onGenerateActa,
}: {
  onDelete: (contract: ContractResource) => void;
  onNotification: (id: number) => void;
  onPreview: (id: number) => void;
  onDownloadWord: (id: number, numero?: string) => void;
  onViewInstallments: (contract: ContractResource) => void;
  onSignature: (contract: ContractResource) => void;
  onGenerateActa?: (contract: ContractResource) => void;
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

      const firstProduct =
        (row.original as any).producto ||
        (row.original as any).productos?.[0] ||
        row.original.contrato_producto_modulos?.[0]?.producto;

      const productName = firstProduct?.nombre || firstProduct?.name || "";
      const productColor = firstProduct?.color || null;

      const typeLabel = castContractType(contractType);
      const displayLabel = productName ? `${typeLabel} - ${productName}` : typeLabel;

      // Resolve effective color from custom product.color or default product brand color
      const lowerName = (productName || displayLabel).toLowerCase();
      let effectiveColor = productColor;

      if (!effectiveColor) {
        if (lowerName.includes("gesrest")) {
          effectiveColor = "#eb5454";
        } else if (lowerName.includes("hotel") || lowerName.includes("hub")) {
          effectiveColor = "#00a3cc";
        } else if (lowerName.includes("360")) {
          effectiveColor = "#7c3aed";
        } else {
          effectiveColor = "#2563eb";
        }
      }

      const customBadgeStyle: React.CSSProperties = {
        backgroundColor: effectiveColor,
        color: "#ffffff",
        borderColor: "transparent",
      };

      return (
        <Badge
          className="flex items-center gap-1.5 font-semibold px-2.5 py-1 text-xs shadow-2xs transition-transform border-0 text-white"
          style={customBadgeStyle}
        >
          {IconComponent && <IconComponent className="h-3.5 w-3.5 shrink-0 text-white" />}
          <span>{displayLabel}</span>
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
          onGenerateActa={onGenerateActa}
        />
      );
    },
  },
];
