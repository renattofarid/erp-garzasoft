import { AxiosRequestConfig } from "axios";
import { api } from "@/lib/config";
import { per_page } from "@/lib/core.function";
import {
  ComprobanteResponse,
  EmisionMasivaPayload,
  EmisionMasivaResult,
} from "./invoicing.interface";

const ENDPOINT = "comprobantes";

export async function getComprobantes({
  page,
  search,
}: {
  page?: number;
  search?: string;
}): Promise<ComprobanteResponse> {
  const config: AxiosRequestConfig = {
    params: {
      page,
      search,
      per_page,
    },
  };
  const { data } = await api.get<ComprobanteResponse>(ENDPOINT, config);
  return data;
}

export async function emitirMasivo(
  payload: EmisionMasivaPayload
): Promise<{ data: EmisionMasivaResult[]; message: string }> {
  const { data } = await api.post<{ data: EmisionMasivaResult[]; message: string }>(
    `${ENDPOINT}/emision-masiva`,
    payload
  );
  return data;
}

export async function reenviarPendientes(): Promise<unknown> {
  const { data } = await api.post(`${ENDPOINT}/reenviar-pendientes`);
  return data;
}
