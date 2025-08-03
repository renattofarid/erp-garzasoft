// hooks/useUsers.ts
import { useEffect } from "react";
import { useTypeUserStore } from "./typeUsers.store";

export function useTypeUsers() {
  const { typeUsers, isLoading, error, fetchTypeUsers } = useTypeUserStore();

  useEffect(() => {
    if (!typeUsers) fetchTypeUsers();
  }, [typeUsers, fetchTypeUsers]);

  return {
    data: typeUsers,
    isLoading,
    error,
    refetch: fetchTypeUsers,
  };
}
