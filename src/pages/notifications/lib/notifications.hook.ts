// hooks/useUsers.ts
import { useEffect } from "react";
import {useContractStore} from "@/pages/contract/lib/contract.store.ts";
import { useNotificationStore } from "./notifications.store";

export function useNotifications(params?: Record<string, any>) {
  const { Notifications, meta, isLoading, error, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (!Notifications) fetchNotifications(params);
  }, [Notifications, fetchNotifications]);

  return {
    data: Notifications,
    meta,
    isLoading,
    error,
    refetch: fetchNotifications,
  };
}

export function useContract(id: number) {
  const { Contract, isFinding, error, fetchContract } = useContractStore();

  useEffect(() => {
    fetchContract(id);
  }, [id]);

  return {
    data: Contract,
    isFinding,
    error,
    refetch: () => fetchContract(id),
  };
}
