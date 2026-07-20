import { Links, Meta } from "@/lib/pagination.interface";
import { ClientResource } from "@/pages/client/lib/client.interface";

export const InvoicingRoute = "/facturacion";
export const InvoicingTitle = "Facturacion electronica";
export const InvoicingDescription = "Emite comprobantes SUNAT a clientes registrados.";
export const InvoicingIconName = "FileText";

export type TipoDocumento = "F" | "B";
export type EstadoComprobante = "E" | "R" | "M" | "T" | "I" | "U" | "V" | "X";

export interface ComprobanteDetalle {
  id?: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: string;
  igv?: string;
  total?: string;
  tipo_igv?: string;
  unidad?: string;
}

export interface ComprobanteResource {
  id: number;
  cliente_id: number;
  cliente?: ClientResource;
  tipo_documento: TipoDocumento;
  serie: string;
  correlativo: number;
  numero: string;
  moneda: string;
  forma_pago: "C" | "D";
  fecha_emision: string;
  subtotal: string;
  igv: string;
  total: string;
  estado: EstadoComprobante;
  estado_label: string;
  solicitud_facturador_id?: string | null;
  nombre_documento?: string | null;
  xml_path?: string | null;
  cdr_path?: string | null;
  pdf_path?: string | null;
  cuota_id?: number | null;
  contrato_id?: number | null;
  error_text?: string | null;
  detalles?: ComprobanteDetalle[];
}

export interface ComprobanteResponse {
  data: ComprobanteResource[];
  links: Links;
  meta: Meta;
}

export interface EmisionMasivaPayload {
  cliente_ids: number[];
  tipo_documento: TipoDocumento;
  serie?: string;
  moneda: string;
  forma_pago: "C" | "D";
  emitir: boolean;
  detalles: ComprobanteDetalle[];
}

export interface EmisionMasivaResult {
  cliente_id: number;
  ok: boolean;
  message?: string;
  comprobante?: ComprobanteResource;
}
