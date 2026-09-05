"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  Check,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorToast, successToast } from "@/lib/core.function";
import { openPdfFromFetcher } from "@/lib/pdf";
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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [rawHtmlTemplate, setRawHtmlTemplate] = useState<string>("");
  const [paperSize, setPaperSize] = useState<"letter" | "a4">("letter");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightInPreview, setHighlightInPreview] = useState(true);

  useEffect(() => {
    if (open && contract) {
      setLoading(true);

      const productId = contract.producto_id || (contract.productos && contract.productos[0]?.id);

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
            CLIENTE_RUC: client?.ruc || client?.dni || "",
            CLIENTE_DIRECCION: client?.direccion || "",
            CLIENTE_TELEFONO: client?.telefono || "",
            CLIENTE_EMAIL: client?.email || "",
            REPRESENTANTE_LEGAL: client?.representante_legal || getClientDisplayName(client),
            FECHA_ALTA: formattedFechaAlta,
            NUMERO_CONTRATO: contract.numero || "",
            COSTO_INSTALACION: contract.costo_instalacion !== undefined ? `S/ ${Number(contract.costo_instalacion).toFixed(2)}` : "",
            MONTO_MENSUAL: contract.monto_mensual !== undefined ? `S/ ${Number(contract.monto_mensual).toFixed(2)}` : "",
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

  // HTML final con variables reemplazadas en vivo para la vista previa
  const processedPreviewHtml = useMemo(() => {
    if (!rawHtmlTemplate) return "";
    return replaceVariablesInHtml(rawHtmlTemplate, variableValues, highlightInPreview);
  }, [rawHtmlTemplate, variableValues, highlightInPreview]);

  // Actualizar un campo del formulario
  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Generar y ver el PDF del Acta con las variables reemplazadas
  const handlePrintPdf = async () => {
    if (!contract) return;
    setGeneratingPdf(true);
    try {
      // Reemplazar variables sin resaltado de fondo para la versión final imprimible
      const finalHtml = replaceVariablesInHtml(rawHtmlTemplate, variableValues, false);

      // Usar print API o backend fetcher
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
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
        }, 600);
      }
      successToast("Acta preparada para vista de impresión / PDF.");
    } catch {
      errorToast("No se pudo generar el documento.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-7xl h-[94vh] max-h-[94vh] p-0 gap-0 overflow-hidden rounded-2xl border shadow-2xl bg-background text-foreground flex flex-col sm:max-w-7xl">
        {/* Cabecera Principal */}
        <DialogHeader className="px-6 py-3.5 border-b bg-card flex flex-row items-center justify-between shrink-0">
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
                Completa las variables dinámicas del acta para {contract?.cliente ? getClientDisplayName(contract.cliente) : "el cliente"}. Revisa su ubicación en vivo.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHighlightInPreview((prev) => !prev)}
              className={`text-xs gap-1.5 h-8 font-semibold transition-all ${
                highlightInPreview
                  ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                  : "text-muted-foreground"
              }`}
              title="Resaltar en celeste las variables reemplazadas en la vista previa"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{highlightInPreview ? "Resaltado Activo" : "Ver Texto Final"}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handlePrintPdf}
              disabled={generatingPdf || loading}
              className="text-xs gap-1.5 h-8 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            >
              {generatingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
              <span>Imprimir / Exportar PDF</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Panel Dividido: Formulario (Izquierda) + Vista Previa Hojas (Derecha) */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-purple-600" />
            <span className="text-sm font-semibold text-muted-foreground">
              Cargando variables y plantilla del Acta de Alta...
            </span>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* PANEL IZQUIERDO: FORMULARIO DE VARIABLES */}
            <div className="w-[420px] min-w-[360px] max-w-[460px] border-r bg-muted/20 dark:bg-zinc-900/60 flex flex-col shrink-0">
              <div className="p-4 border-b bg-card/60 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Braces className="h-3.5 w-3.5 text-purple-600" />
                    <span>Variables Detectadas ({activeVariables.length})</span>
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    Auto-completadas
                  </span>
                </div>

                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar variable..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Lista de Campos de Formulario */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4 pb-6">
                  {filteredVariables.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No se encontraron variables con el término de búsqueda.
                    </div>
                  ) : (
                    filteredVariables.map((v) => (
                      <div
                        key={v.key}
                        className="bg-card border border-border/70 rounded-xl p-3.5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col gap-2 group"
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* PANEL DERECHO: VISTA PREVIA EN VIVO DE LAS HOJAS */}
            <div
              className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start relative"
              style={{ backgroundColor: "#525659" }}
            >
              <div className="w-full flex justify-between items-center max-w-[820px] mb-4 bg-zinc-900/90 text-white text-xs px-4 py-2 rounded-xl backdrop-blur-md shadow-lg border border-zinc-700 select-none">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>Vista Previa en Vivo del Acta ({paperSize === "letter" ? "Carta" : "A4"})</span>
                </span>
                <span className="text-[11px] text-zinc-400">
                  Las variables se muestran resaltadas en azul en las hojas
                </span>
              </div>

              {/* Render del HTML con variables reemplazadas */}
              <div
                className="w-full flex flex-col items-center focus:outline-none"
                dangerouslySetInnerHTML={{ __html: processedPreviewHtml }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
