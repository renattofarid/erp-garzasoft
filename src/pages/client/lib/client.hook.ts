// hooks/useUsers.ts
import { useEffect } from "react";
import { useClientStore } from "./client.store.ts";

export function useClients() {
  const { clients, isLoading, error, fetchClients } = useClientStore();

  useEffect(() => {
    if (!clients) fetchClients();
  }, [clients, fetchClients]);

  return {
    data: clients,
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
