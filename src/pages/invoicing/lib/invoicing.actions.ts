import { AxiosRequestConfig } from "axios";
import { api } from "@/lib/config";
import { per_page } from "@/lib/core.function";
import {
  ActualizarComprobantePayload,
  ComprobanteResource,
  ComprobanteResponse,
  EmisionMasivaPayload,
  EmisionMasivaResult,
} from "./invoicing.interface";

const ENDPOINT = "comprobantes";

export async function getComprobantes({
  page,
  search,
  perPage,
}: {
  page?: number;
  search?: string;
  perPage?: number;
}): Promise<ComprobanteResponse> {
  const config: AxiosRequestConfig = {
    params: {
      page,
      search,
      per_page: perPage ?? per_page,
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

export async function reenviarPendientes(): Promise<{
  data: Array<{ id: number; ok: boolean; message?: string | null }>;
}> {
  const { data } = await api.post(`${ENDPOINT}/reenviar-pendientes`);
  return data;
}

export async function getComprobantePdf(id: number): Promise<Blob> {
  const { data } = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
}

export async function getComprobante(id: number): Promise<ComprobanteResource> {
  const { data } = await api.get<{ data: ComprobanteResource }>(`${ENDPOINT}/${id}`);
  return data.data;
}

export async function actualizarComprobante(
  id: number,
  payload: ActualizarComprobantePayload
): Promise<ComprobanteResource> {
  const { data } = await api.put<{ data: ComprobanteResource }>(`${ENDPOINT}/${id}`, payload);
  return data.data;
}

export async function emitirComprobante(id: number): Promise<ComprobanteResource> {
  const { data } = await api.post<{ data: ComprobanteResource }>(`${ENDPOINT}/${id}/emitir`);
  return data.data;
}

export async function downloadComprobanteFile(
  id: number,
  type: "xml" | "cdr" | "zip"
): Promise<Blob> {
  const suffix = {
    xml: "download-xml",
    cdr: "download-cdr",
    zip: "download-zip",
  }[type];
  const { data } = await api.get(`${ENDPOINT}/${id}/${suffix}`, {
    responseType: "blob",
  });
  return data;
}

export async function enviarComprobanteWhatsApp(
  id: number,
  celular?: string
): Promise<{ status: number; message: string; data: any }> {
  const { data } = await api.post<{ status: number; message: string; data: any }>(
    `${ENDPOINT}/${id}/enviar-whatsapp`,
    { celular }
  );
  return data;
}

export async function envioMasivoWhatsApp(): Promise<{
  status: number;
  message: string;
  data: { totales: number; enviados: number; fallidos: number };
}> {
  const { data } = await api.post<{
    status: number;
    message: string;
    data: { totales: number; enviados: number; fallidos: number };
  }>(`${ENDPOINT}/envio-masivo-whatsapp`);
  return data;
}
