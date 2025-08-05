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
import { Meta } from "@/lib/pagination.interface";

interface TypeUserStore {
  typeUsers: TypeUserResource[] | null;
  typeUser: TypeUserResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchTypeUsers: (params?: Record<string, any>) => Promise<void>;
  fetchTypeUser: (id: number) => Promise<void>;
  createTypeUser: (data: TypeUserSchema) => Promise<void>;
  updateTypeUser: (id: number, data: TypeUserSchema) => Promise<void>;
}

export const useTypeUserStore = create<TypeUserStore>((set) => ({
  typeUser: null,
  typeUsers: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchTypeUsers: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getTypeUser({ params });
      set({ typeUsers: data, meta: meta, isLoading: false });
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

  updateTypeUser: async (id: number, data: TypeUserSchema) => {
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
