// stores/clientStore.ts
import { create } from "zustand";
import { ClientResource } from "./client.interface.ts";
import {
  findClientById,
  getClient,
  storeClient,
  updateClient,
} from "./client.actions.ts";
import { ClientSchema } from "./client.schema.ts";

interface ClientStore {
  clients: ClientResource[] | null;
  client: ClientResource | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchClients: () => Promise<void>;
  fetchClient: (id: number) => Promise<void>;
  createClient: (data: ClientSchema) => Promise<void>;
  updateClient: (id: number, data: ClientSchema) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  client: null,
  clients: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await getClient({});
      set({ clients: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
    }
  },

  fetchClient: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findClientById(id);
      set({ client: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de usuario", isFinding: false });
    }
  },

  createClient: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeClient(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateClient: async (id: number, data: ClientSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateClient(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
