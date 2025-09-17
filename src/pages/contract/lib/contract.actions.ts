import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
import {
  getContractProps,
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

export async function storeContract(data: any): Promise<ContractResponse> {
  const response = await api.post<ContractResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateContract(
  id: number,
  data: any
): Promise<ContractResponse> {
  const response = await api.put<ContractResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteContract(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
