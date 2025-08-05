// hooks/useUsers.ts
import { useEffect } from "react";
import { useTypeUserStore } from "./typeUsers.store";

export function useTypeUsers(params?: Record<string, any>) {
  const { typeUsers, meta, isLoading, error, fetchTypeUsers } =
    useTypeUserStore();

  useEffect(() => {
    if (!typeUsers) fetchTypeUsers(params);
  }, [typeUsers, fetchTypeUsers]);

  return {
    data: typeUsers,
    meta,
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
