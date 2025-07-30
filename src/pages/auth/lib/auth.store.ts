import { create } from "zustand";
import type { User } from "./auth.interface";

interface AuthState {
  token: string | null;
  user: User | null;
  message: string | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setMessage: (message: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  message: localStorage.getItem("message"),
  person: null,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  setMessage: (message) => {
    localStorage.setItem("message", message);
    set({ message });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("message");
    set({ token: null, user: null, message: null });
  },
}));
