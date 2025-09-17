import { useEffect } from "react";
import { useCuentasPorCobrarStore } from "./accounts-receivable.store";

export function useCuentasPorCobrar(params?: Record<string, any>) {
  const { 
    cuentasPorCobrar, 
    meta, 
    isLoading, 
    error, 
    fetchCuentasPorCobrar 
  } = useCuentasPorCobrarStore();

  useEffect(() => {
    if (!cuentasPorCobrar) fetchCuentasPorCobrar(params);
  }, [cuentasPorCobrar, fetchCuentasPorCobrar]);

  return {
    data: cuentasPorCobrar,
    meta,
    isLoading,
    error,
    refetch: fetchCuentasPorCobrar,
  };
}

export function useAllCuentasPorCobrar() {
  const { 
    allCuentasPorCobrar, 
    isLoading, 
    error, 
    fetchAllCuentasPorCobrar 
  } = useCuentasPorCobrarStore();

  useEffect(() => {
    if (!allCuentasPorCobrar) fetchAllCuentasPorCobrar();
  }, [allCuentasPorCobrar, fetchAllCuentasPorCobrar]);

  return {
    data: allCuentasPorCobrar,
    isLoading,
    error,
    refetch: fetchAllCuentasPorCobrar,
  };
}

export function useCuentaPorCobrar(id: number) {
  const { 
    cuentaPorCobrar, 
    isFinding, 
    error, 
    fetchCuentaPorCobrar 
  } = useCuentasPorCobrarStore();

  useEffect(() => {
    fetchCuentaPorCobrar(id);
  }, [id]);

  return {
    data: cuentaPorCobrar,
    isFinding,
    error,
    refetch: () => fetchCuentaPorCobrar(id),
  };
}

export function usePagos(params?: Record<string, any>) {
  const { 
    pagos, 
    metaPagos, 
    isLoadingPagos, 
    error, 
    fetchPagos 
  } = useCuentasPorCobrarStore();

  useEffect(() => {
    if (!pagos) fetchPagos(params);
  }, [pagos, fetchPagos]);

  return {
    data: pagos,
    meta: metaPagos,
    isLoading: isLoadingPagos,
    error,
    refetch: fetchPagos,
  };
}