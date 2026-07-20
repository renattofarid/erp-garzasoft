import { AxiosRequestConfig } from "axios";
import {
  ClientSchema,
} from "./client.schema.ts";
import {
  ClientDniLookupResponse,
  ClientPortalUserPayload,
  ClientPortalUserResponse,
  getClientProps,
  ClientLookupResponse,
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

export async function lookupClientByRuc(
  ruc: string
): Promise<ClientLookupResponse> {
  const response = await api.get<ClientLookupResponse>(
    `${ENDPOINT}/consulta-ruc/${ruc}`
  );
  return response.data;
}

export async function lookupClientByDni(
  dni: string
): Promise<ClientDniLookupResponse> {
  const response = await api.get<ClientDniLookupResponse>(
    `${ENDPOINT}/consulta-dni/${dni}`
  );
  return response.data;
}

export async function storeClient(data: ClientSchema): Promise<ClientResponse> {
  const response = await api.post<ClientResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateClient(
  id: number,
  data: ClientSchema
): Promise<ClientResponse> {
  const response = await api.put<ClientResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteClient(id: number): Promise<unknown> {
  const { data } = await api.delete<unknown>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getClientPortalUser(
  id: number
): Promise<ClientPortalUserResponse> {
  const { data } = await api.get<ClientPortalUserResponse>(
    `${ENDPOINT}/${id}/portal-user`
  );
  return data;
}

export async function saveClientPortalUser(
  id: number,
  payload: ClientPortalUserPayload
): Promise<ClientPortalUserResponse> {
  const { data } = await api.put<ClientPortalUserResponse>(
    `${ENDPOINT}/${id}/portal-user`,
    payload
  );
  return data;
}
