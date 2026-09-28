import { api } from "@/lib/config";
import {
  ContactDniLookupResult,
  ContactResource,
  ContactResponse,
  GetContactProps,
} from "./contact.interface";

const ENDPOINT = "contactos";

export async function getContacts({ params }: GetContactProps): Promise<ContactResponse> {
  const { data } = await api.get<ContactResponse>(ENDPOINT, { params });
  return data;
}

export async function getAllContacts(): Promise<ContactResource[]> {
  const { data } = await api.get<ContactResponse>(ENDPOINT, { params: { all: true } });
  return data.data;
}

export async function findContactById(id: number): Promise<ContactResource> {
  const { data } = await api.get<{ status: number; data: ContactResource }>(`${ENDPOINT}/${id}`);
  return data.data;
}

export async function lookupContactByDni(dni: string): Promise<ContactDniLookupResult> {
  const { data } = await api.get<ContactDniLookupResult>(`${ENDPOINT}/buscar-dni/${dni}`);
  return data;
}

export async function updateContact(
  id: number,
  payload: Partial<Pick<ContactResource, "nombre" | "celular" | "email" | "es_dueno" | "es_vendedor">>
): Promise<ContactResource> {
  const { data } = await api.put<{ status: number; data: ContactResource }>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data.data;
}

export async function deleteContact(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
