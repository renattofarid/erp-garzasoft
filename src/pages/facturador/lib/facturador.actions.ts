import { api } from "@/lib/config";
import { FacturadorResponse } from "./facturador.interface";
import { FacturadorSchema } from "./facturador.schema";

const ENDPOINT = "facturadores/activo";

export async function getActiveFacturador() {
  const { data } = await api.get<FacturadorResponse>(ENDPOINT);
  return data;
}

export async function saveActiveFacturador(payload: FacturadorSchema) {
  const { data } = await api.put<FacturadorResponse>(ENDPOINT, payload);
  return data;
}
