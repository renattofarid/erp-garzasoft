// stores/typeUserStore.ts
import { create } from "zustand";
import { TypeUserResource } from "./client.interface.ts";
import {
  findTypeUserById,
  getTypeUser,
  storeTypeUser,
  updateTypeUser,
} from "./client.actions.ts";
import { ClientSchema } from "./client.schema.ts";

interface TypeUserStore {
  typeUsers: TypeUserResource[] | null;
  typeUser: TypeUserResource | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchTypeUsers: () => Promise<void>;
  fetchTypeUser: (id: number) => Promise<void>;
  createTypeUser: (data: ClientSchema) => Promise<void>;
  updateTypeUser: (id: number, data: ClientSchema) => Promise<void>;
}

export const useTypeUserStore = create<TypeUserStore>((set) => ({
  typeUser: null,
  typeUsers: null,
  isLoading: false,
  isFinding: false,
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

  fetchTypeUser: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findTypeUserById(id);
      set({ typeUser: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de usuario", isFinding: false });
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

  updateTypeUser: async (id: number, data: ClientSchema) => {
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
