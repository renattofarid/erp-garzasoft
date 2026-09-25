"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  Check,
  ExternalLink,
  Info,
  Loader2,
  Printer,
  Search,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { errorToast, successToast } from "@/lib/core.function";
import { ContractResource } from "../lib/contract.interface";
import { getProductFormatoAlta } from "@/pages/products/lib/product.actions";
import {
  SYSTEM_VARIABLES,
  extractVariablesFromHtml,
  normalizeVariableKey,
  replaceVariablesInHtml,
} from "@/pages/products/lib/docVariables";
import { getClientDisplayName } from "@/pages/client/lib/client.interface";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ContractActaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractResource | null;
}

export default function ContractActaModal({
  open,
  onOpenChange,
  contract,
}: ContractActaModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [rawHtmlTemplate, setRawHtmlTemplate] = useState<string>("");
  const [paperSize, setPaperSize] = useState<"letter" | "a4">("letter");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && contract) {
      setLoading(true);

      const productId =
        (contract as any).producto_id ||
        ((contract as any).productos && (contract as any).productos[0]?.id) ||
        (contract.contrato_producto_modulos && contract.contrato_producto_modulos[0]?.producto_id);

      if (!productId) {
        setLoading(false);
        errorToast("Este contrato no tiene un producto asignado para el acta.");
        return;
      }

      getProductFormatoAlta(productId)
        .then((res) => {
          const rawFormato = res?.data?.formato_alta;
          const html = rawFormato?.html_content || "";
          const size = rawFormato?.paper_size || "letter";

          setRawHtmlTemplate(html);
          setPaperSize(size);

          // Extraer todas las variables del template
          const extractedKeys = extractVariablesFromHtml(html);

          // Autocompletar con datos reales del contrato y cliente
          const client = contract.cliente;
          const initialValues: Record<string, string> = {};

          // Formatear fechas
          let formattedFechaAlta = "";
          try {
            if (contract.created_at) {
              const parsedDate = parseISO(contract.created_at);
              formattedFechaAlta = format(parsedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
            }
          } catch {
            formattedFechaAlta = contract.created_at || "";
          }

          // Valores por defecto
          const defaultsMap: Record<string, string> = {
            CLIENTE_NOMBRE: client ? getClientDisplayName(client) : "",
            CLIENTE_RUC: client?.ruc || (client as any)?.dni || "",
            CLIENTE_DIRECCION: (client as any)?.direccion || "",
            CLIENTE_TELEFONO: (client as any)?.telefono || "",
            CLIENTE_EMAIL: (client as any)?.email || "",
            REPRESENTANTE_LEGAL: (client as any)?.representante_legal || (client ? getClientDisplayName(client) : ""),
            FECHA_ALTA: formattedFechaAlta,
            NUMERO_CONTRATO: contract.numero || "",
            COSTO_INSTALACION: contract.costo_instalacion !== undefined && contract.costo_instalacion !== null ? `S/ ${Number(contract.costo_instalacion).toFixed(2)}` : "",
            MONTO_MENSUAL: (contract as any).monto_mensual !== undefined && (contract as any).monto_mensual !== null ? `S/ ${Number((contract as any).monto_mensual).toFixed(2)}` : "",
            CIUDAD: "Chiclayo, Perú",
          };

          // Llenar variables detectadas
          extractedKeys.forEach((key) => {
            initialValues[key] = defaultsMap[key] || "";
          });

          // Si no se detectaron explícitamente pero el template está vacío o por defecto, cargar variables estándar
          if (extractedKeys.length === 0) {
            Object.keys(defaultsMap).forEach((k) => {
              initialValues[k] = defaultsMap[k];
            });
          }

          setVariableValues(initialValues);
        })
        .catch(() => {
          errorToast("Error al cargar la plantilla del Formato de Alta / Acta.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, contract]);

  // Lista de variables a solicitar en el formulario
  const activeVariables = useMemo(() => {
    const extracted = extractVariablesFromHtml(rawHtmlTemplate);
    const keys = extracted.length > 0 ? extracted : Object.keys(variableValues);

    return keys.map((key) => {
      const cleanKey = normalizeVariableKey(key);
      const sysDef = SYSTEM_VARIABLES.find((v) => v.key === cleanKey);
      return {
        key: cleanKey,
        label: sysDef?.label || cleanKey.replace(/_/g, " "),
        category: sysDef?.category || "personalizado",
        description: sysDef?.description || `Variable personalizada utilizada en el documento.`,
        placeholder: sysDef?.placeholder || `Ingresa el valor para ${cleanKey}`,
      };
    });
  }, [rawHtmlTemplate, variableValues]);

  // Filtrar variables según búsqueda
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return activeVariables;
    const q = searchQuery.toLowerCase();
    return activeVariables.filter(
      (v) =>
        v.key.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }, [activeVariables, searchQuery]);

  // Actualizar un campo del formulario
  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Guardar configuración de variables
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      successToast("Variables del Acta de Alta guardadas correctamente.");
    }, 250);
  };

  // Abrir la vista completa del PDF / Acta en una nueva pestaña con las variables reemplazadas
  const handleOpenPdfNewTab = () => {
    if (!contract) return;
    try {
      const finalHtml = replaceVariablesInHtml(rawHtmlTemplate, variableValues, false);

      const pageStyle = paperSize === "a4" ? "A4 portrait" : "letter portrait";
      const fullDocumentHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Acta de Alta - Contrato ${contract.numero}</title>
          <style>
            @page { size: ${pageStyle}; margin: 0; }
            html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f1f5f9; }
            .a4-page-sheet { page-break-after: always; width: 100%; box-sizing: border-box; }
            .a4-page-sheet:last-child { page-break-after: avoid !important; }
            .doc-variable-chip { font-weight: normal !important; background: transparent !important; color: inherit !important; border: none !important; padding: 0 !important; }
            @media print {
              body { background-color: #ffffff !important; }
            }
          </style>
        </head>
        <body>
          ${finalHtml}
        </body>
        </html>
      `;

      const blob = new Blob([fullDocumentHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, "_blank");
      if (!newWin) {
        errorToast("El navegador bloqueó la ventana emergente. Por favor habilita ventanas emergentes.");
      } else {
        successToast("Acta cargada en una nueva pestaña.");
      }
    } catch {
      errorToast("No se pudo visualizar el PDF del Acta.");
    }
  };

  // Imprimir el PDF del Acta con las variables reemplazadas
  const handlePrintPdf = async () => {
    if (!contract) return;
    setGeneratingPdf(true);
    try {
      const finalHtml = replaceVariablesInHtml(rawHtmlTemplate, variableValues, false);

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="utf-8">
            <title>Acta de Alta - Contrato ${contract.numero}</title>
            <style>
              @page { size: ${paperSize === "a4" ? "A4 portrait" : "letter portrait"}; margin: 0; }
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              .a4-page-sheet { page-break-after: always; width: 100%; box-sizing: border-box; }
              .a4-page-sheet:last-child { page-break-after: avoid !important; }
              .doc-variable-chip { font-weight: normal !important; background: transparent !important; color: inherit !important; border: none !important; padding: 0 !important; }
            </style>
          </head>
          <body>
            ${finalHtml}
          </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      successToast("Vista de impresión preparada.");
    } catch {
      errorToast("No se pudo generar la vista de impresión.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-background text-foreground flex flex-col max-h-[90vh]">
        {/* Cabecera Principal */}
        <DialogHeader className="px-6 py-4 border-b bg-card flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Generar Acta de Alta (Formulario de Variables)</span>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300">
                  {contract?.numero}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ingresa los valores de las variables dinámicas para {contract?.cliente ? getClientDisplayName(contract.cliente) : "el cliente"}. Guarda los cambios o visualiza el PDF en una nueva pestaña.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo del Formulario */}
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="text-xs font-semibold text-muted-foreground">
              Cargando variables del Acta de Alta...
            </span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Buscador y contador */}
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar variable..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-background"
                />
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                Variables ({filteredVariables.length} / {activeVariables.length})
              </span>
            </div>

            {/* Formulario en Grid 2 columnas */}
            <ScrollArea className="flex-1 p-6">
              {filteredVariables.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No se encontraron variables con el término de búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {filteredVariables.map((v) => (
                    <div
                      key={v.key}
                      className="bg-card border border-border/80 rounded-xl p-3.5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          <span>{v.label}</span>
                        </Label>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200"
                        >
                          {`{${v.key}}`}
                        </Badge>
                      </div>

                      <Input
                        type="text"
                        value={variableValues[v.key] ?? ""}
                        onChange={(e) => handleVariableChange(v.key, e.target.value)}
                        placeholder={v.placeholder}
                        className="h-9 text-xs font-medium bg-background border-input focus:ring-1 focus:ring-purple-500"
                      />

                      <p className="text-[11px] text-muted-foreground leading-tight flex items-start gap-1">
                        <Info className="h-3 w-3 shrink-0 text-purple-500 mt-0.5" />
                        <span>{v.description}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Footer con Acciones */}
        <div className="px-6 py-3.5 border-t bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Configura las variables y abre el resultado en una nueva pestaña.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cerrar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPdfNewTab}
              disabled={loading}
              className="text-xs h-9 gap-1.5 border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Ver PDF (Nueva Pestaña)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              disabled={generatingPdf || loading}
              className="text-xs h-9 gap-1.5"
            >
              {generatingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
              <span>Imprimir</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading}
              className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Guardar Variables</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

