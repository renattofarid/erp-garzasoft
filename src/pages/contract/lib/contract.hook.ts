// hooks/useUsers.ts
import { useEffect } from "react";
import { useContractStore } from "@/pages/contract/lib/contract.store.ts";

export function useContracts(params?: Record<string, any>) {
  const { Contracts, meta, isLoading, error, fetchContracts } =
    useContractStore();

  useEffect(() => {
    if (!Contracts) fetchContracts(params);
  }, [Contracts, fetchContracts]);

  return {
    data: Contracts,
    meta,
    isLoading,
    error,
    refetch: fetchContracts,
  };
}

export function useAllContracts(params?: Record<string, any>) {
  const { AllContracts, meta, isLoadingAll, error, fetchAllContracts } =
    useContractStore();

  useEffect(() => {
    if (!AllContracts) fetchAllContracts(params);
  }, [AllContracts, fetchAllContracts]);

  return {
    data: AllContracts,
    meta,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllContracts,
  };
}

export function useContract(id: number) {
  const { Contract, isFinding, error, fetchContract } = useContractStore();

  useEffect(() => {
    fetchContract(id);
  }, [id]);

  return {
    data: Contract,
    isFinding,
    error,
    refetch: () => fetchContract(id),
  };
}
