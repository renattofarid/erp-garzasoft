import type { ClientResource } from "@/pages/client/lib/client.interface";

export const findClientById = (
  clients: ClientResource[],
  id?: number | null
): ClientResource | null => {
  if (!id) return null;

  for (const client of clients) {
    if (client.id === id) return client;

    const nested = findClientById(client.hijos_clientes ?? [], id);
    if (nested) return nested;
  }

  return null;
};

export const findRootClientById = (
  clients: ClientResource[],
  id?: number | null
): ClientResource | null => {
  if (!id) return null;

  for (const client of clients) {
    if (client.id === id) return client;

    const nested = client.hijos_clientes?.length
      ? findRootClientById(client.hijos_clientes, id)
      : null;

    if (nested) return client;
  }

  return null;
};

export const getLeafClients = (client: ClientResource): ClientResource[] => {
  const children = client.hijos_clientes ?? [];

  if (children.length === 0) {
    return [client];
  }

  return children.flatMap((child) => getLeafClients(child));
};

export const getClientPath = (
  clients: ClientResource[],
  id?: number | null
): ClientResource[] => {
  if (!id) return [];

  for (const client of clients) {
    if (client.id === id) return [client];

    const nestedPath = getClientPath(client.hijos_clientes ?? [], id);
    if (nestedPath.length > 0) {
      return [client, ...nestedPath];
    }
  }

  return [];
};

export const getClientHierarchyLabel = (
  clients: ClientResource[],
  id?: number | null
): string => {
  const path = getClientPath(clients, id);

  if (path.length === 0) return "Sin cliente";

  return path
    .map((client) => client.nombre_cliente || client.razon_social || client.nombre_comercial || "Sin nombre")
    .join(" / ");
};
