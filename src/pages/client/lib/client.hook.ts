// hooks/useUsers.ts
import { useEffect } from "react";
import { useClientStore } from "./client.store.ts";

export function useClients(params?: Record<string, any>) {
  const { clients, meta, isLoading, error, fetchClients } = useClientStore();

  useEffect(() => {
    if (!clients) fetchClients(params);
  }, [clients, fetchClients]);

  return {
    data: clients,
    meta,
    isLoading,
    error,
    refetch: fetchClients,
  };
}

export function useClient(id: number) {
  const { client, isFinding, error, fetchClient } = useClientStore();

  useEffect(() => {
    fetchClient(id);
  }, [id]);

  return {
    data: client,
    isFinding,
    error,
    refetch: () => fetchClient(id),
  };
}
