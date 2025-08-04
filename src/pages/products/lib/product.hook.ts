// hooks/useUsers.ts
import { useEffect } from "react";
import { useProductStore } from "./product.store";

export function useProducts() {
  const { Products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    if (!Products) fetchProducts();
  }, [Products, fetchProducts]);

  return {
    data: Products,
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
