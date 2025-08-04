// stores/ProductStore.ts
import { create } from "zustand";
import { ProductResource } from "./product.interface";
import { ProductSchema } from "./prodcut.schema";
import { findProductById, getProduct, storeProduct, updateProduct } from "./product.actions";


interface ProductStore {
  Products: ProductResource[] | null;
  Product: ProductResource | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: ProductSchema) => Promise<void>;
  updateProduct: (id: number, data: ProductSchema) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  Product: null,
  Products: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await getProduct({});
      set({ Products: data, isLoading: false });
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
