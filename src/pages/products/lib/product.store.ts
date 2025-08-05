// stores/ProductStore.ts
import { create } from "zustand";
import { ProductResource } from "./product.interface";
import { ProductSchema } from "./product.schema";
import {
  findProductById,
  getProduct,
  storeProduct,
  updateProduct,
} from "./product.actions";
import { Meta } from "@/lib/pagination.interface";

interface ProductStore {
  Products: ProductResource[] | null;
  Product: ProductResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchProducts: (params?: Record<string, any>) => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: ProductSchema) => Promise<void>;
  updateProduct: (id: number, data: ProductSchema) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  Product: null,
  Products: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProducts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getProduct({ params });
      set({ Products: data, meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
    }
  },

  fetchProduct: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findProductById(id);
      set({ Product: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el Producto", isFinding: false });
    }
  },

  createProduct: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeProduct(data);
    } catch (err) {
      set({ error: "Error al crear el Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateProduct: async (id: number, data: ProductSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateProduct(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Producto" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
