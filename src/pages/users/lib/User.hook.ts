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
