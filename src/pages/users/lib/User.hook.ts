// hooks/useUsers.ts
import { useEffect } from "react";
import { useUserStore } from "./Users.store";

export function useUsers(params?: Record<string, any>) {
  const { Users, meta, isLoading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    if (!Users) fetchUsers(params);
  }, [Users, fetchUsers]);

  return {
    data: Users,
    meta,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}

export function useUser(id: number) {
  const { User, isFinding, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(id);
  }, [id]);

  return {
    data: User,
    isFinding,
    error,
    refetch: () => fetchUser(id),
  };
}
