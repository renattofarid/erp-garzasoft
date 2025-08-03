// stores/typeUserStore.ts
import { create } from "zustand";
import { TypeUserResource } from "./typeUser.interface";
import { getTypeUser, storeTypeUser } from "./typeUser.actions";
import { TypeUserSchema } from "./typeUser.schema";

interface TypeUserStore {
  typeUsers: TypeUserResource[] | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchTypeUsers: () => Promise<void>;
  createTypeUser: (data: TypeUserSchema) => Promise<void>;
}

export const useTypeUserStore = create<TypeUserStore>((set) => ({
  typeUsers: null,
  isLoading: false,
  isSubmitting: false,
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

  createTypeUser: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeTypeUser(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
