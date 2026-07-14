import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
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
      ...params,
      per_page,
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
  const previewWindow = window.open("", "_blank");
  const blob = await getContractPdf(id);
  const url = URL.createObjectURL(blob);

  if (previewWindow) {
    previewWindow.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function getNextContractNumber(): Promise<string> {
  const response = await api.get<{ status: number; data: { numero: string } }>(
    `${ENDPOINT}/siguiente-numero`
  );

  return response.data.data.numero;
}
