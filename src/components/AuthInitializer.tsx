import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useEffect } from "react";

export const AuthInitializer = () => {
  const { authenticate } = useAuthStore();

  useEffect(() => {
    authenticate();
  }, []);

  return null;
};
