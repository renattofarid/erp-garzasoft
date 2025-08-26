// stores/ContractStore.ts
import { create } from "zustand";
import { ContractResource } from "./contract.interface.ts";
import {
  findContractById,
  getAllContracts,
  getContract,
  storeContract,
  updateContract,
} from "./contract.actions.ts";
import { Meta } from "@/lib/pagination.interface";
import { ContractSchema } from "@/pages/contract/lib/contract.schema.ts";

interface ContractStore {
  Contracts: ContractResource[] | null;
  AllContracts: ContractResource[] | null;
  Contract: ContractResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isLoadingAll: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchContracts: (params?: Record<string, any>) => Promise<void>;
  fetchAllContracts: (params?: Record<string, any>) => Promise<void>;
  fetchContract: (id: number) => Promise<void>;
  createContract: (data: ContractSchema) => Promise<void>;
  updateContract: (id: number, data: ContractSchema) => Promise<void>;
}

export const useContractStore = create<ContractStore>((set) => ({
  Contract: null,
  Contracts: null,
  AllContracts: null,
  meta: null,
  isLoading: false,
  isLoadingAll: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchContracts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getContract({ params });
      set({ Contracts: data, meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar Contratos", isLoading: false });
    }
  },

  fetchAllContracts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getAllContracts({
        params,
      });
      set({ AllContracts: data, meta, isLoadingAll: false });
    } catch (err) {
      set({
        error: "Error al cargar Todos los Contratos",
        isLoadingAll: false,
      });
    }
  },

  fetchContract: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findContractById(id);
      set({ Contract: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el Contrato", isFinding: false });
    }
  },

  createContract: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeContract(data);
    } catch (err) {
      set({ error: "Error al crear el Contrato" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateContract: async (id: number, data: ContractSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateContract(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Contrato" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
