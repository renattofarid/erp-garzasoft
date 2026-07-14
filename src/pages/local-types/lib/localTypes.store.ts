import { create } from "zustand";
import { Meta } from "@/lib/pagination.interface";
import {
  findLocalTypeById,
  getLocalType,
  storeLocalType,
  updateLocalType,
} from "./localType.actions";
import { LocalTypeSchema } from "./localType.schema";
import { LocalTypeResource } from "./localType.interface";

interface LocalTypeStore {
  localTypes: LocalTypeResource[] | null;
  localType: LocalTypeResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchLocalTypes: (params?: Record<string, any>) => Promise<void>;
  fetchLocalType: (id: number) => Promise<void>;
  createLocalType: (data: LocalTypeSchema) => Promise<void>;
  updateLocalType: (id: number, data: LocalTypeSchema) => Promise<void>;
}

export const useLocalTypeStore = create<LocalTypeStore>((set) => ({
  localTypes: null,
  localType: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchLocalTypes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getLocalType({ params });
      set({ localTypes: data, meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar tipos de local", isLoading: false });
    }
  },

  fetchLocalType: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findLocalTypeById(id);
      set({ localType: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el tipo de local", isFinding: false });
    }
  },

  createLocalType: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeLocalType(data);
    } catch (error) {
      set({ error: "Error al crear el tipo de local" });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateLocalType: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateLocalType(id, data);
    } catch (error) {
      set({ error: "Error al actualizar el tipo de local" });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
