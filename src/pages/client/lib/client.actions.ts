import { AxiosRequestConfig } from "axios";
import {
  getClientProps,
  ClientResource,
  ClientResourceById,
  ClientResponse,
} from "./client.interface.ts";
import { api } from "@/lib/config";

const ENDPOINT = "clientes";

export async function getClient({
  params,
}: getClientProps): Promise<ClientResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ClientResponse>(ENDPOINT, config);
  return data;
}

export async function getAllClients(): Promise<ClientResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ClientResponse>(ENDPOINT, config);
  return data.data;
}

export async function findClientById(id: number): Promise<ClientResourceById> {
  const response = await api.get<ClientResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeClient(data: any): Promise<ClientResponse> {
  const response = await api.post<ClientResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateClient(
  id: number,
  data: any
): Promise<ClientResponse> {
  const response = await api.put<ClientResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteClient(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
