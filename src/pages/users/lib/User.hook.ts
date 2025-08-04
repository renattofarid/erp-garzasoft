// hooks/useUsers.ts
import { useEffect } from "react";
import { useUserStore } from "./Users.store";

export function useUsers() {
  const { Users, isLoading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    if (!Users) fetchUsers();
  }, [Users, fetchUsers]);

  return {
    data: Users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
