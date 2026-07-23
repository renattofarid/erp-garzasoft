import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
import { openPdfFromFetcher } from "@/lib/pdf";
import {
  getContractProps,
  ContractMutationResponse,
  ContractResourceById,
  ContractResponse,
} from "./contract.interface.ts";
import { per_page } from "@/lib/core.function";

const ENDPOINT = "contratos";

export async function getContract({
  params,
}: getContractProps): Promise<ContractResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page,
      ...params,
    },
  };
  const { data } = await api.get<ContractResponse>(ENDPOINT, config);
  return data;
}

export async function getAllContracts({
  params,
}: getContractProps): Promise<ContractResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ContractResponse>(ENDPOINT, config);
  return data;
}

export async function findContractById(
  id: number
): Promise<ContractResourceById> {
  const response = await api.get<ContractResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeContract(data: any): Promise<ContractMutationResponse> {
  const response = await api.post<ContractMutationResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateContract(
  id: number,
  data: any
): Promise<ContractMutationResponse> {
  const response = await api.put<ContractMutationResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteContract(
  id: number,
  payload?: { motivo_anulacion?: string; fecha_anulacion: string }
): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`, {
    data: payload,
  });
  return data;
}

export async function getContractPdf(id: number): Promise<Blob> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });

  return response.data;
}

export async function openContractPdf(id: number): Promise<void> {
  return openPdfFromFetcher(
    () => getContractPdf(id),
    "Generando PDF del Contrato..."
  );
}

export async function getNextContractNumber(): Promise<string> {
  const response = await api.get<{ status: number; data: { numero: string } }>(
    `${ENDPOINT}/siguiente-numero`
  );

  return response.data.data.numero;
}

export async function saveContractSignatures(
  id: number,
  payload: {
    firma_arrendador?: string | null;
    firma_cliente?: string | null;
    guardar_como_default_arrendador?: boolean;
  }
): Promise<ContractMutationResponse> {
  const { data } = await api.post<ContractMutationResponse>(
    `${ENDPOINT}/${id}/firmas`,
    payload
  );
  return data;
}

export async function getFacturadorActivo(): Promise<any> {
  const { data } = await api.get<{ status: number; data: any }>(
    "facturadores/activo"
  );
  return data.data;
}
