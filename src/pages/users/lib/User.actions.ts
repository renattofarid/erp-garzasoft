import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
import {
  getUserProps,
  UserResource,
  UserResourceById,
  UserResponse,
} from "./User.interface";
import { per_page } from "@/lib/core.function";

const ENDPOINT = "usuarios";

export async function getUser({ params }: getUserProps): Promise<UserResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<UserResponse>(ENDPOINT, config);
  return data;
}

export async function getAllUsers(): Promise<UserResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<UserResource[]>(ENDPOINT, config);
  return data;
}

export async function findUserById(id: number): Promise<UserResourceById> {
  const response = await api.get<UserResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeUser(data: any): Promise<UserResponse> {
  const response = await api.post<UserResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateUser(id: number, data: any): Promise<UserResponse> {
  const response = await api.put<UserResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteUser(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
