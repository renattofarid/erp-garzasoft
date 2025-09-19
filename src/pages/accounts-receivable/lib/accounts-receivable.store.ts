import { create } from "zustand";
import { Meta } from "@/lib/pagination.interface";
import {
  CuentasPorCobrarResource,
  PagoResource,
} from "./accounts-receivable.interface";
import {
  getCuentasPorCobrar,
  getAllCuentasPorCobrar,
  findCuentaPorCobrarById,
  storeCuentaPorCobrar,
  updateCuentaPorCobrar,
  getPagos,
  storePago,
  updatePago,
} from "./accounts-receivable.actions";
import {
  CuentasPorCobrarSchema,
  PagoSchema,
} from "./accounts-receivable.schema";

interface CuentasPorCobrarStore {
  // Cuotas
  cuentasPorCobrar: CuentasPorCobrarResource[] | null;
  allCuentasPorCobrar: CuentasPorCobrarResource[] | null;
  cuentaPorCobrar: CuentasPorCobrarResource | null;

  // Pagos
  pagos: PagoResource[] | null;
  pago: PagoResource | null;

  // Meta y estados
  meta: Meta | null;
  metaPagos: Meta | null;
  isLoading: boolean;
  isLoadingPagos: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;

  // Métodos para cuotas
  fetchCuentasPorCobrar: (params?: Record<string, any>) => Promise<void>;
  fetchAllCuentasPorCobrar: () => Promise<void>;
  fetchCuentaPorCobrar: (id: number) => Promise<void>;
  createCuentaPorCobrar: (data: CuentasPorCobrarSchema) => Promise<void>;
  updateCuentaPorCobrar: (
    id: number,
    data: CuentasPorCobrarSchema
  ) => Promise<void>;

  // Métodos para pagos
  fetchPagos: (params?: Record<string, any>) => Promise<void>;
  createPago: (data: PagoSchema & { comprobante?: File }) => Promise<void>;
  updatePago: (
    id: number,
    data: PagoSchema & { comprobante?: File }
  ) => Promise<void>;
}

export const useCuentasPorCobrarStore = create<CuentasPorCobrarStore>(
  (set) => ({
    // Estados iniciales
    cuentasPorCobrar: null,
    allCuentasPorCobrar: null,
    cuentaPorCobrar: null,
    pagos: null,
    pago: null,
    meta: null,
    metaPagos: null,
    isLoading: false,
    isLoadingPagos: false,
    isFinding: false,
    isSubmitting: false,
    error: null,

    // Métodos para cuotas
    fetchCuentasPorCobrar: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: null });
      try {
        const { data, meta } = await getCuentasPorCobrar({ params });
        set({ cuentasPorCobrar: data, meta, isLoading: false });
      } catch (err) {
        set({
          error: "Error al cargar las cuentas por cobrar",
          isLoading: false,
        });
      }
    },

    fetchAllCuentasPorCobrar: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await getAllCuentasPorCobrar();
        set({ allCuentasPorCobrar: data, isLoading: false });
      } catch (err) {
        set({
          error: "Error al cargar todas las cuentas por cobrar",
          isLoading: false,
        });
      }
    },

    fetchCuentaPorCobrar: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const { data } = await findCuentaPorCobrarById(id);
        set({ cuentaPorCobrar: data, isFinding: false });
      } catch (err) {
        set({
          error: "Error al cargar la cuenta por cobrar",
          isFinding: false,
        });
      }
    },

    createCuentaPorCobrar: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        await storeCuentaPorCobrar(data);
      } catch (err) {
        set({ error: "Error al crear la cuenta por cobrar" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updateCuentaPorCobrar: async (id: number, data: CuentasPorCobrarSchema) => {
      set({ isSubmitting: true, error: null });
      try {
        await updateCuentaPorCobrar(id, data);
      } catch (err) {
        set({ error: "Error al actualizar la cuenta por cobrar" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // Métodos para pagos
    fetchPagos: async (params?: Record<string, any>) => {
      set({ isLoadingPagos: true, error: null });
      try {
        const { data, meta } = await getPagos(params);
        set({ pagos: data, metaPagos: meta, isLoadingPagos: false });
      } catch (err) {
        set({ error: "Error al cargar los pagos", isLoadingPagos: false });
      }
    },

    createPago: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        const formData = new FormData();
        formData.append("cuota_id", data.cuota_id.toString());
        formData.append("fecha_pago", data.fecha_pago);
        formData.append("monto_pagado", data.monto_pagado.toString());

        if (data.comprobante) {
          formData.append("comprobante", data.comprobante);
        }

        await storePago(formData);
      } catch (err) {
        set({ error: "Error al crear el pago" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },

    updatePago: async (id: number, data) => {
      set({ isSubmitting: true, error: null });
      try {
        const formData = new FormData();
        formData.append("cuota_id", data.cuota_id.toString());
        formData.append("fecha_pago", data.fecha_pago);
        formData.append("monto_pagado", data.monto_pagado.toString());

        if (data.comprobante) {
          formData.append("comprobante", data.comprobante);
        }

        await updatePago(id, formData);
      } catch (err) {
        set({ error: "Error al actualizar el pago" });
        throw err;
      } finally {
        set({ isSubmitting: false });
      }
    },
  })
);
