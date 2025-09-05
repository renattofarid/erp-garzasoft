import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
import {
  getNotificationProps,
  NotificationResource,
  NotificationResourceById,
  NotificationResponse,
} from "./notification.interface";
import { per_page } from "@/lib/core.function";

const ENDPOINT = "notificationos";

export async function getNotification({
  params,
}: getNotificationProps): Promise<NotificationResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<NotificationResponse>(ENDPOINT, config);
  return data;
}

export async function getAllNotifications(): Promise<NotificationResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all Notifications
    },
  };
  const { data } = await api.get<NotificationResource[]>(ENDPOINT, config);
  return data;
}

export async function findNotificationById(
  id: number
): Promise<NotificationResourceById> {
  const response = await api.get<NotificationResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeNotification(
  data: any
): Promise<NotificationResponse> {
  const response = await api.post<NotificationResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateNotification(
  id: number,
  data: any
): Promise<NotificationResponse> {
  const response = await api.put<NotificationResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteNotification(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
