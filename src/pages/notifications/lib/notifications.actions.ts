import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";

import { per_page } from "@/lib/core.function";
import { getNotificationsProps, NotificationsResource, NotificationsResourceById, NotificationsResponse } from "./notifications.interface";

const ENDPOINT = "notificaciones";

export async function getNotification({
  params,
}: getNotificationsProps): Promise<NotificationsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<NotificationsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllNotifications(): Promise<NotificationsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all Notificationss
    },
  };
  const { data } = await api.get<NotificationsResource[]>(ENDPOINT, config);
  return data;
}

export async function findNotificationsById(
  id: number
): Promise<NotificationsResourceById> {
  const response = await api.get<NotificationsResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeNotifications(data: any): Promise<NotificationsResponse> {
  const response = await api.post<NotificationsResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateNotifications(
  id: number,
  data: any
): Promise<NotificationsResponse> {
  const response = await api.put<NotificationsResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteNotifications(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
