import { create } from "zustand";
import type { Usuario } from "./auth.interface";
import { authenticate } from "./auth.actions";

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;
  message: string | null;
  setToken: (token: string) => void;
  setUser: (user: Usuario) => void;
  setMessage: (message: string) => void;
  authenticate: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
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

  authenticate: async () => {
    const { usuario } = await authenticate();
    if (usuario) {
      localStorage.setItem("user", JSON.stringify(usuario));
      set({
        user: usuario,
        isAuthenticated: true,
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
      });
    }
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("message");
    set({ token: null, user: null, message: null });
  },
}));
