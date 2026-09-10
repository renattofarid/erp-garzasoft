import { ColumnDef } from "@tanstack/react-table";
import {
  CuentasPorCobrarResource,
  SituacionCuota,
} from "../lib/accounts-receivable.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  DollarSign,
  Eye,
  Info,
  RefreshCcw,
  Send,
  Trash2,
} from "lucide-react";
import { WhatsAppIcon, ZipIcon } from "@/components/icons/DocumentIcons";
import { format, parse } from "date-fns";
import {
  castSituacionCuota,
  getIconBySituacion,
  getSituacionVariant,
} from "../lib/accounts-receivable.functions";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";

export const CuentasPorCobrarColumns = ({
  onEdit,
  onDelete,
  onPay,
  onResendInvoice,
  onGenerateInvoice,
  onDownloadZip,
  onReviewInvoice,
  onWhatsAppReminder,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPay: (id: number) => void;
  onResendInvoice: (cuota: CuentasPorCobrarResource) => void;
  onGenerateInvoice: (cuota: CuentasPorCobrarResource) => void;
  onDownloadZip: (cuota: CuentasPorCobrarResource) => void;
  onReviewInvoice: (cuota: CuentasPorCobrarResource) => void;
  onWhatsAppReminder: (cuota: CuentasPorCobrarResource) => void;
}): ColumnDef<CuentasPorCobrarResource>[] => [
  {
    accessorKey: "contrato.numero",
    header: "Número Contrato",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "contrato.cliente",
    header: "Cliente",
    cell: ({ row }) => getClientDisplayName(row.original.contrato.cliente),
  },
  {
    accessorKey: "monto_pendiente",
    header: "Monto Pendiente",
    cell: ({ row }) => (
      <span className="font-bold text-foreground">
        S/. {Number(row.original.monto_pendiente).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "fecha_vencimiento",
    header: "Fecha de Vencimiento",
    cell: ({ getValue }) => {
      const fechaVencimiento = format(
        parse(
          (getValue() as string).split("T").shift() || "",
          "yyyy-MM-dd",
          new Date()
        ),
        "dd/MM/yyyy"
      );
      return <Badge variant="outline">{fechaVencimiento}</Badge>;
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
      const cuota = row.original;
      const id = cuota.id;
      const situacion = cuota.situacion;
      const comprobante = cuota.comprobante;

      return (
        <TooltipProvider delayDuration={100} disableHoverableContent>
          <div className="flex items-center gap-1.5">
            {/* 1. Registrar Pago (Verde) / Ver Detalles (Azul) */}
            {situacion !== "pagado" ? (
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="size-8 rounded-full bg-[#10B981] hover:bg-[#059669] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                    aria-label="Registrar pago"
                    onMouseLeave={(e) => e.currentTarget.blur()}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onPay(id);
                    }}
                  >
                    <DollarSign className="size-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                  Registrar Pago
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="size-8 rounded-full bg-[#1E88E5] hover:bg-[#1976D2] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                    aria-label="Ver detalles"
                    onMouseLeave={(e) => e.currentTarget.blur()}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onEdit(id);
                    }}
                  >
                    <Eye className="size-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                  Ver Detalles
                </TooltipContent>
              </Tooltip>
            )}

            {/* 2. Facturación: Generar o Revisar / Reenviar / ZIP */}
            {!comprobante ? (
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="size-8 rounded-full bg-[#FBC02D] hover:bg-[#F9A825] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                    aria-label="Generar factura SUNAT"
                    onMouseLeave={(e) => e.currentTarget.blur()}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onGenerateInvoice(cuota);
                    }}
                  >
                    <Send className="size-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                  Generar factura
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                {/* Revisar Factura / Estado / Error */}
                <Tooltip disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      className={`size-8 rounded-full text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0 ${
                        comprobante.estado === "X"
                          ? "bg-[#D32F2F] hover:bg-[#B71C1C] animate-pulse ring-2 ring-red-400"
                          : "bg-[#1E88E5] hover:bg-[#1976D2]"
                      }`}
                      aria-label={comprobante.estado === "X" ? "Ver error y corregir factura" : "Revisar factura"}
                      onMouseLeave={(e) => e.currentTarget.blur()}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onReviewInvoice(cuota);
                      }}
                    >
                      {comprobante.estado === "X" ? (
                        <AlertCircle className="size-4 text-white" />
                      ) : (
                        <Info className="size-4 text-white" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                    {comprobante.estado === "X" ? "Ver error y corregir" : "Revisar factura"}
                  </TooltipContent>
                </Tooltip>

                {/* Reenviar si falló */}
                {!["M", "T"].includes(comprobante.estado) && (
                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        className="size-8 rounded-full bg-[#FBC02D] hover:bg-[#F9A825] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                        aria-label="Reenviar factura"
                        onMouseLeave={(e) => e.currentTarget.blur()}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onResendInvoice(cuota);
                        }}
                      >
                        <RefreshCcw className="size-4 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                      Reenviar factura
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Descargar ZIP SUNAT */}
                {(comprobante.zip_path || ["M", "T"].includes(comprobante.estado)) && (
                  <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        className="size-8 rounded-full bg-[#FB8C00] hover:bg-[#F57C00] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                        aria-label="Descargar ZIP SUNAT"
                        onMouseLeave={(e) => e.currentTarget.blur()}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onDownloadZip(cuota);
                        }}
                      >
                        <ZipIcon className="size-4 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                      Descargar ZIP SUNAT
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}

            {/* 3. Recordatorio WhatsApp (Verde) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#43A047] hover:bg-[#388E3C] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Recordatorio WhatsApp"
                  onMouseLeave={(e) => e.currentTarget.blur()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onWhatsAppReminder(cuota);
                  }}
                >
                  <WhatsAppIcon className="size-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                Recordatorio WhatsApp
              </TooltipContent>
            </Tooltip>

            {/* 4. Eliminar (Rojo) */}
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                  aria-label="Eliminar cuota"
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
