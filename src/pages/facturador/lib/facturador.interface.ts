import { Building2 } from "lucide-react";

export const FacturadorRoute = "/empresa-emisora";
export const FacturadorTitle = "Empresa emisora";
export const FacturadorDescription =
  "Configura los datos fiscales y credenciales WSDL del emisor MrSoft.";
export const FacturadorIconName = "Building2";
export const FacturadorIcon = Building2;

export interface FacturadorResource {
  id?: number;
  ruc?: string | null;
  razon_social?: string | null;
  nombre_comercial?: string | null;
  direccion?: string | null;
  usuario_sol?: string | null;
  clave_sol?: string | null;
  token?: string | null;
  wsdl_factura?: string | null;
  wsdl_boleta?: string | null;
  wsdl_consulta?: string | null;
  wsdl_bajas?: string | null;
  modo?: "simulacion" | "produccion" | null;
  porcentaje_igv?: number | null;
  activo?: boolean;
}

export interface FacturadorResponse {
  status: number;
  data: FacturadorResource | null;
  message?: string;
}
