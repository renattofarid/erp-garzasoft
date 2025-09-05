// hooks/useUsers.ts
import { useEffect } from "react";
import { usenotificationStore } from "./notification.store";

export function useNotifications(params?: Record<string, any>) {
  const { notifications, meta, isLoading, error, fetchnotifications } =
    usenotificationStore();

  useEffect(() => {
    if (!notifications) fetchnotifications(params);
  }, [notifications, fetchnotifications]);

  return {
    data: notifications,
    meta,
    isLoading,
    error,
    refetch: fetchnotifications,
  };
}

export function useNotification(id: number) {
  const { notification, isFinding, error, fetchnotification } =
    usenotificationStore();

  useEffect(() => {
    fetchnotification(id);
  }, [id]);

  return {
    data: notification,
    isFinding,
    error,
    refetch: () => fetchnotification(id),
  };
}
