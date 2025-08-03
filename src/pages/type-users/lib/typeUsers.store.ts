// stores/typeUserStore.ts
import { create } from "zustand";
import { TypeUserResource } from "./typeUser.interface";
import {
  findTypeUserById,
  getTypeUser,
  storeTypeUser,
  updateTypeUser,
} from "./typeUser.actions";
import { TypeUserSchema } from "./typeUser.schema";

interface TypeUserStore {
  typeUsers: TypeUserResource[] | null;
  typeUser: TypeUserResource | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchTypeUsers: () => Promise<void>;
  fetchTypeUser: (id: string) => Promise<void>;
  createTypeUser: (data: TypeUserSchema) => Promise<void>;
  updateTypeUser: (id: string, data: TypeUserSchema) => Promise<void>;
}

export const useTypeUserStore = create<TypeUserStore>((set) => ({
  typeUser: null,
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

  fetchTypeUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await findTypeUserById(id);
      set({ typeUser: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de usuario", isLoading: false });
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

  updateTypeUser: async (id: string, data: TypeUserSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateTypeUser(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
