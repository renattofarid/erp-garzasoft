// stores/userStore.ts
import { create } from "zustand";
import { TypeUserResource } from "./typeUser.interface";
import { getTypeUser } from "./typeUser.actions";

interface UserStore {
  typeUsers: TypeUserResource[] | null;
  isLoading: boolean;
  error: string | null;
  fetchTypeUsers: () => Promise<void>;
}

export const useTypeUserStore = create<UserStore>((set) => ({
  typeUsers: null,
  isLoading: false,
  error: null,
  fetchTypeUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await getTypeUser({});
      set({ typeUsers: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
    }
  },
}));
