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

export function useTypeUser(id: number) {
  const { typeUser, isFinding, error, fetchTypeUser } = useTypeUserStore();

  useEffect(() => {
    fetchTypeUser(id);
  }, [id]);

  return {
    data: typeUser,
    isFinding,
    error,
    refetch: () => fetchTypeUser(id),
  };
}
