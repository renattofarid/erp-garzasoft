import { AxiosRequestConfig } from "axios";

import { api } from "@/lib/config";
import {
  getProductProps,
  ProductResource,
  ProductResourceById,
  ProductResponse,
} from "./product.interface";
import { per_page } from "@/lib/core.function";

const ENDPOINT = "productos";

export type ProductCollectionResponse = ProductResponse | ProductResource[];

export async function getProduct({
  params,
}: getProductProps): Promise<ProductCollectionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page,
    },
  };
  const { data } = await api.get<ProductCollectionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProducts(): Promise<ProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all Products
    },
  };
  const { data } = await api.get<ProductResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductById(
  id: number
): Promise<ProductResourceById> {
  const response = await api.get<ProductResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProduct(data: any): Promise<ProductResponse> {
  const response = await api.post<ProductResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: any
): Promise<ProductResponse> {
  const response = await api.put<ProductResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getProductFormatoAlta(id: number): Promise<any> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}/formato-alta`);
  return data;
}

export async function updateProductFormatoAlta(
  id: number,
  formatoAlta: any
): Promise<any> {
  const { data } = await api.put<any>(`${ENDPOINT}/${id}/formato-alta`, {
    formato_alta: formatoAlta,
  });
  return data;
}

export async function getFormatoAltaPdfBlob(
  id: number,
  params?: Record<string, any>
): Promise<Blob> {
  const response = await api.get(`${ENDPOINT}/${id}/formato-alta/pdf`, {
    params,
    responseType: "blob",
  });
  return response.data;
}
