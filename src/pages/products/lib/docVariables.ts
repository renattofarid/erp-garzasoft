export interface DocVariableDef {
  key: string;
  label: string;
  category: "cliente" | "contrato" | "servicio" | "personalizado";
  description: string;
  placeholder?: string;
}

export const SYSTEM_VARIABLES: DocVariableDef[] = [
  {
    key: "CLIENTE_NOMBRE",
    label: "Nombre / Razón Social del Cliente",
    category: "cliente",
    description: "Nombre completo o Razón Social del restaurante/empresa cliente.",
    placeholder: "Ej: Restaurante El Buen Sabor S.A.C.",
  },
  {
    key: "CLIENTE_RUC",
    label: "RUC / DNI del Cliente",
    category: "cliente",
    description: "Número de RUC o DNI del cliente.",
    placeholder: "Ej: 20601234567",
  },
  {
    key: "CLIENTE_DIRECCION",
    label: "Dirección del Establecimiento",
    category: "cliente",
    description: "Dirección del local comercial o fiscal del cliente.",
    placeholder: "Ej: Av. Primavera 123, Urb. Los Olivos, Chiclayo",
  },
  {
    key: "CLIENTE_TELEFONO",
    label: "Teléfono de Contacto",
    category: "cliente",
    description: "Teléfono o celular del cliente.",
    placeholder: "Ej: 987654321",
  },
  {
    key: "CLIENTE_EMAIL",
    label: "Correo Electrónico",
    category: "cliente",
    description: "Email de contacto para facturación/notificaciones.",
    placeholder: "Ej: contacto@elbuensabor.pe",
  },
  {
    key: "REPRESENTANTE_LEGAL",
    label: "Representante Legal",
    category: "cliente",
    description: "Nombre completo del representante legal del cliente.",
    placeholder: "Ej: Juan Alberto Pérez García",
  },
  {
    key: "FECHA_ALTA",
    label: "Fecha de Alta / Inicio",
    category: "contrato",
    description: "Fecha de entrega o inicio del servicio del producto.",
    placeholder: "Ej: 05 de Septiembre de 2026",
  },
  {
    key: "NUMERO_CONTRATO",
    label: "Número de Contrato",
    category: "contrato",
    description: "Código o número correlativo del contrato.",
    placeholder: "Ej: CONT-2026-0042",
  },
  {
    key: "COSTO_INSTALACION",
    label: "Costo de Instalación",
    category: "contrato",
    description: "Monto cobrado por concepto de instalación / capacitación.",
    placeholder: "Ej: S/ 150.00",
  },
  {
    key: "MONTO_MENSUAL",
    label: "Monto de Cuota Mensual",
    category: "contrato",
    description: "Valor de la cuota mensual del servicio.",
    placeholder: "Ej: S/ 120.00",
  },
  {
    key: "CIUDAD",
    label: "Ciudad / Ubicación",
    category: "servicio",
    description: "Ciudad donde se realiza el contrato o instalación.",
    placeholder: "Ej: Chiclayo, Perú",
  },
];

/**
 * Normaliza la clave de variable a un formato estándar de mayúsculas sin espacios
 * Ejemplo: "Nombre del Mozo" -> "NOMBRE_DEL_MOZO"
 */
export function normalizeVariableKey(rawKey: string): string {
  return rawKey
    .trim()
    .toUpperCase()
    .replace(/[{}]/g, "")
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/_+/g, "_");
}

/**
 * Retorna el HTML del badge / chip interactivo para insertar en contentEditable
 */
export function createVariableChipHtml(key: string, customLabel?: string): string {
  const cleanKey = normalizeVariableKey(key);
  const sysDef = SYSTEM_VARIABLES.find((v) => v.key === cleanKey);
  const labelText = customLabel || sysDef?.label || cleanKey;

  return `<span class="doc-variable-chip" data-variable-key="${cleanKey}" title="Variable dinámica: ${labelText}" contenteditable="false" style="display: inline-flex; align-items: center; gap: 4px; background-color: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; padding: 1.5px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; margin: 0 3px; font-family: monospace; line-height: 1.3; vertical-align: baseline; user-select: all; box-shadow: 0 1px 2px rgba(107, 33, 168, 0.1); cursor: pointer;"><span style="color: #a855f7; font-size: 12px; font-weight: 800;">{x}</span><span>${cleanKey}</span></span>`;
}

/**
 * Escanea un HTML y extrae todas las variables únicas ({VAR_KEY} o data-variable-key)
 */
export function extractVariablesFromHtml(html: string): string[] {
  if (!html) return [];
  const foundKeys = new Set<string>();

  // 1. Extraer de atributos data-variable-key
  const dataKeyRegex = /data-variable-key=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = dataKeyRegex.exec(html)) !== null) {
    if (match[1]) {
      foundKeys.add(normalizeVariableKey(match[1]));
    }
  }

  // 2. Extraer de sintaxis {KEY} o {{KEY}}
  const curlyRegex = /\{{1,2}([A-Z0-9_]{3,30})\}}{1,2}/gi;
  while ((match = curlyRegex.exec(html)) !== null) {
    if (match[1]) {
      foundKeys.add(normalizeVariableKey(match[1]));
    }
  }

  return Array.from(foundKeys);
}

/**
 * Reemplaza en el HTML todas las fichas de variables por su valor correspondiente o por su etiqueta resaltada
 */
export function replaceVariablesInHtml(
  html: string,
  values: Record<string, string>,
  highlightReplaced: boolean = false
): string {
  if (!html) return "";

  let result = html;

  // Reemplazar chips <span class="doc-variable-chip" data-variable-key="KEY"...>...</span>
  const chipRegex = /<span[^>]*class=["'][^"']*doc-variable-chip[^"']*["'][^>]*data-variable-key=["']([^"']+)["'][^>]*>[\s\S]*?<\/span>/gi;

  result = result.replace(chipRegex, (fullMatch, rawKey) => {
    const cleanKey = normalizeVariableKey(rawKey);
    const val = values[cleanKey] ?? values[rawKey] ?? `{${cleanKey}}`;

    if (highlightReplaced && values[cleanKey] !== undefined) {
      return `<strong class="replaced-variable-val" style="color: #0284c7; background-color: #e0f2fe; padding: 1px 5px; border-radius: 4px; font-weight: 700;">${val}</strong>`;
    }
    return val;
  });

  // Reemplazar sintaxis libre {KEY} o {{KEY}}
  Object.keys(values).forEach((key) => {
    const cleanKey = normalizeVariableKey(key);
    const val = values[key];
    if (val !== undefined) {
      const regex = new RegExp(`\\{\\{?${cleanKey}\\}?\\}`, "gi");
      result = result.replace(regex, val);
    }
  });

  return result;
}
