import { AxiosRequestConfig } from "axios";
import { api } from "@/lib/config";
import { per_page } from "@/lib/core.function";
import {
  getCuentasPorCobrarProps,
  CuentasPorCobrarResource,
  CuentasPorCobrarResourceById,
  CuentasPorCobrarResponse,
  PagoResponse,
  PagoResource,
} from "./accounts-receivable.interface";

const ENDPOINT_CUOTAS = "cuotas";
const ENDPOINT_PAGOS = "pagos";

// CUOTAS ENDPOINTS
export async function getCuentasPorCobrar({
  params,
}: getCuentasPorCobrarProps): Promise<CuentasPorCobrarResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<CuentasPorCobrarResponse>(
    ENDPOINT_CUOTAS,
    config
  );
  return data;
}

export async function getAllCuentasPorCobrar(): Promise<
  CuentasPorCobrarResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<CuentasPorCobrarResource[]>(
    ENDPOINT_CUOTAS,
    config
  );
  return data;
}

export async function findCuentaPorCobrarById(
  id: number
): Promise<CuentasPorCobrarResourceById> {
  const response = await api.get<CuentasPorCobrarResourceById>(
    `${ENDPOINT_CUOTAS}/${id}`
  );
  return response.data;
}

export async function storeCuentaPorCobrar(
  data: any
): Promise<CuentasPorCobrarResponse> {
  const response = await api.post<CuentasPorCobrarResponse>(
    ENDPOINT_CUOTAS,
    data
  );
  return response.data;
}

export async function updateCuentaPorCobrar(
  id: number,
  data: any
): Promise<CuentasPorCobrarResponse> {
  const response = await api.put<CuentasPorCobrarResponse>(
    `${ENDPOINT_CUOTAS}/${id}`,
    data
  );
  return response.data;
}

export async function deleteCuentaPorCobrar(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT_CUOTAS}/${id}`);
  return data;
}

// PAGOS ENDPOINTS
export async function getPagos(
  params?: Record<string, any>
): Promise<PagoResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<PagoResponse>(ENDPOINT_PAGOS, config);
  return data;
}

export async function findPagoById(id: number): Promise<PagoResource> {
  const response = await api.get<PagoResource>(`${ENDPOINT_PAGOS}/${id}`);
  return response.data;
}

export async function storePago(data: FormData): Promise<any> {
  const response = await api.post<any>(ENDPOINT_PAGOS, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updatePago(id: number, data: FormData): Promise<any> {
  const response = await api.put<any>(`${ENDPOINT_PAGOS}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deletePago(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT_PAGOS}/${id}`);
  return data;
}
