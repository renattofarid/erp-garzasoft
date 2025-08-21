// hooks/useUsers.ts
import { useEffect } from "react";
import { useProductStore } from "./product.store";

export function useProducts(params?: Record<string, any>) {
  const { Products, meta, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!Products) fetchProducts(params);
  }, [Products, fetchProducts]);

  return {
    data: Products,
    meta,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

export function useAllProducts() {
  const { Products, meta, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!Products)
      fetchProducts({
        all: true,
      });
  }, [Products, fetchProducts]);

  return {
    data: Products,
    meta,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

export function useProduct(id: number) {
  const { Product, isFinding, error, fetchProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  return {
    data: Product,
    isFinding,
    error,
    refetch: () => fetchProduct(id),
  };
}
