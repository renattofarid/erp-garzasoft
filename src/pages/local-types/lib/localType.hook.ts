import { useEffect } from "react";
import { useLocalTypeStore } from "./localTypes.store";

export function useLocalTypes(params?: Record<string, any>) {
  const { localTypes, meta, isLoading, error, fetchLocalTypes } =
    useLocalTypeStore();

  useEffect(() => {
    if (!localTypes) fetchLocalTypes(params);
  }, [localTypes, fetchLocalTypes]);

  return {
    data: localTypes,
    meta,
    isLoading,
    error,
    refetch: fetchLocalTypes,
  };
}

export function useLocalType(id: number) {
  const { localType, isFinding, error, fetchLocalType } = useLocalTypeStore();

  useEffect(() => {
    fetchLocalType(id);
  }, [id]);

  return {
    data: localType,
    isFinding,
    error,
    refetch: () => fetchLocalType(id),
  };
}
