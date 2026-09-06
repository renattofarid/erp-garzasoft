import { AxiosRequestConfig } from "axios";
import { api } from "@/lib/config";
import { per_page } from "@/lib/core.function";
import {
  GetLocalTypeProps,
  LocalTypeResource,
  LocalTypeResourceById,
  LocalTypeResponse,
} from "./localType.interface";

const ENDPOINT = "tipos-local";

export async function getLocalType({
  params,
}: GetLocalTypeProps): Promise<LocalTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<LocalTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllLocalTypes(): Promise<LocalTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<LocalTypeResponse>(ENDPOINT, config);
  return data.data;
}

export async function findLocalTypeById(
  id: number
): Promise<LocalTypeResourceById> {
  const response = await api.get<LocalTypeResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeLocalType(data: any): Promise<LocalTypeResponse> {
  const response = await api.post<LocalTypeResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateLocalType(
  id: number,
  data: any
): Promise<LocalTypeResponse> {
  const response = await api.put<LocalTypeResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteLocalType(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
