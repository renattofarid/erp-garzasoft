import { useEffect, useMemo, useState } from "react";
import { Search, Send, RefreshCcw, AlertCircle, Info, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WhatsAppIcon, PdfIcon, ZipIcon } from "@/components/icons/DocumentIcons";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorToast, successToast } from "@/lib/core.function";
import { openPdfFromFetcher } from "@/lib/pdf";
import { getAllClients, lookupClientByDni, lookupClientByRuc } from "@/pages/client/lib/client.actions";
import {
  ClientResource,
  getClientDisplayName,
} from "@/pages/client/lib/client.interface";
import {
  emitirMasivo,
  getComprobantes,
  getComprobantePdf,
  downloadComprobanteFile,
  reenviarPendientes,
  sincronizarFacturador,
  crearComprobanteLibre,
} from "../lib/invoicing.actions";
import {
  ComprobanteResource,
  EmisionMasivaPayload,
  ComprobanteLibrePayload,
  InvoicingDescription,
  InvoicingIconName,
  InvoicingTitle,
  TipoDocumento,
} from "../lib/invoicing.interface";
import { WhatsAppComprobanteModal } from "./WhatsAppComprobanteModal";
import { ComprobanteRecoveryDialog } from "./ComprobanteRecoveryDialog";

const estadoColor: Record<string, string> = {
  E: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  R: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  M: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  T: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  X: "bg-red-500/15 text-red-400 border-red-500/30",
  I: "bg-red-500/15 text-red-400 border-red-500/30",
  V: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function InvoicingPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [freeModalOpen, setFreeModalOpen] = useState(false);
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeRecipientMode, setFreeRecipientMode] = useState<"registered" | "external">("registered");
  const [externalLookupLoading, setExternalLookupLoading] = useState(false);
  const [freeClientQuery, setFreeClientQuery] = useState("");
  const [freeClientPickerOpen, setFreeClientPickerOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppComprobante, setWhatsAppComprobante] =
    useState<ComprobanteResource | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryComprobante, setRecoveryComprobante] =
    useState<ComprobanteResource | null>(null);

  const [comprobantes, setComprobantes] = useState<ComprobanteResource[]>([]);
  const [clientes, setClientes] = useState<ClientResource[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [freeForm, setFreeForm] = useState<ComprobanteLibrePayload>({
    cliente_id: 0,
    tipo_documento: "F",
    serie: "F001",
    moneda: "PEN",
    forma_pago: "C",
    fecha_emision: new Date().toISOString().slice(0, 10),
    emitir: true,
    detalles: [{ descripcion: "", cantidad: 1, precio_unitario: 0, tipo_igv: "10", unidad: "NIU" }],
  });

  const [form, setForm] = useState<EmisionMasivaPayload>({
    cliente_ids: [],
    tipo_documento: "F",
    serie: "F001",
    moneda: "PEN",
    forma_pago: "C",
    emitir: true,
    detalles: [
      {
        descripcion: "Servicio de desarrollo de software",
        cantidad: 1,
        precio_unitario: 100,
        tipo_igv: "10",
        unidad: "NIU",
      },
    ],
  });

  const selectedClientes = useMemo(
    () => clientes.filter((cliente) => form.cliente_ids.includes(cliente.id)),
    [clientes, form.cliente_ids]
  );

  const clientesVisibles = useMemo(() => {
    return clientes.filter((cliente) => {
      if (cliente.no_facturado_efectivo) return false;
      return form.tipo_documento !== "F" || /^\d{11}$/.test(cliente.ruc || "");
    });
  }, [clientes, form.tipo_documento]);

  const clientesNoFacturados = useMemo(
    () => clientes.filter((cliente) => cliente.no_facturado_efectivo).length,
    [clientes]
  );

  const freeClientsFiltered = useMemo(() => {
    const query = freeClientQuery.trim().toLowerCase();
    if (!query) return clientes.slice(0, 8);
    return clientes.filter((cliente) => {
      const contactDocuments = (cliente.contactos_clientes || []).map((contacto) => contacto.dni || "").join(" ");
      return [getClientDisplayName(cliente), cliente.ruc || "", contactDocuments].some((value) => value.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [clientes, freeClientQuery]);

  const freeSelectedClient = clientes.find((cliente) => cliente.id === freeForm.cliente_id);

  const loadComprobantes = async () => {
    setLoading(true);
    try {
      const response = await getComprobantes({ page, search, perPage: pageSize });
      setComprobantes(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
      setTotalItems(response.meta?.total || 0);
    } catch {
      errorToast("No se pudieron cargar los comprobantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComprobantes();
  }, [page, pageSize, search]);

  useEffect(() => {
    getAllClients()
      .then(setClientes)
      .catch(() => errorToast("No se pudieron cargar los clientes."));
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      cliente_ids: current.cliente_ids.filter((clienteId) =>
        clientes.some(
          (cliente) =>
            cliente.id === clienteId &&
            !cliente.no_facturado_efectivo &&
            (form.tipo_documento !== "F" || /^\d{11}$/.test(cliente.ruc || ""))
        )
      ),
    }));
  }, [form.tipo_documento, clientes]);

  const toggleCliente = (id: number) => {
    setForm((current) => ({
      ...current,
      cliente_ids: current.cliente_ids.includes(id)
        ? current.cliente_ids.filter((clienteId) => clienteId !== id)
        : [...current.cliente_ids, id],
    }));
  };

  const updateTipoDocumento = (tipo: TipoDocumento) => {
    setForm((current) => ({
      ...current,
      tipo_documento: tipo,
      serie: tipo === "F" ? "F001" : "B001",
    }));
  };

  const updateFreeTipoDocumento = (tipo: TipoDocumento) => {
    setFreeForm((current) => ({ ...current, tipo_documento: tipo, serie: tipo === "F" ? "F001" : "B001" }));
  };

  const addFreeDetail = () => {
    setFreeForm((current) => ({
      ...current,
      detalles: [...current.detalles, { descripcion: "", cantidad: 1, precio_unitario: 0, tipo_igv: "10", unidad: "NIU" }],
    }));
  };

  const updateFreeDetail = (index: number, field: string, value: string | number) => {
    setFreeForm((current) => ({
      ...current,
      detalles: current.detalles.map((detail, detailIndex) => detailIndex === index ? { ...detail, [field]: value } : detail),
    }));
  };

  const removeFreeDetail = (index: number) => {
    setFreeForm((current) => ({ ...current, detalles: current.detalles.filter((_, detailIndex) => detailIndex !== index) }));
  };

  const submitComprobanteLibre = async () => {
    if (freeRecipientMode === "registered" && !freeForm.cliente_id) return errorToast("Selecciona un cliente.");
    if (freeRecipientMode === "external" && !/^\d{8,11}$/.test(freeForm.receptor_documento || "")) {
      return errorToast("Ingresa un DNI de 8 dígitos o RUC de 11 dígitos.");
    }
    if (!freeForm.detalles.every((detail) => detail.descripcion.trim() && detail.cantidad > 0 && detail.precio_unitario > 0)) {
      return errorToast("Completa la descripción, cantidad y precio de cada detalle.");
    }
    setFreeLoading(true);
    try {
      const payload = freeRecipientMode === "registered"
        ? { ...freeForm, receptor_documento: undefined, receptor_nombre: undefined, receptor_direccion: undefined }
        : { ...freeForm, cliente_id: undefined };
      const result = await crearComprobanteLibre(payload);
      setFreeModalOpen(false);
      successToast(result.estado === "X" ? result.error_text || "El facturador rechazó el comprobante." : "Comprobante creado y enviado al facturador.");
      await loadComprobantes();
    } catch (error: any) {
      const message = error?.response?.data?.message || Object.values(error?.response?.data?.errors || {})?.flat()?.[0] || "No se pudo crear el comprobante.";
      errorToast(String(message));
    } finally {
      setFreeLoading(false);
    }
  };

  const lookupExternalDocument = async () => {
    const identityDocument = freeForm.receptor_documento || "";
    const isDni = /^\d{8}$/.test(identityDocument);
    const isRuc = /^\d{11}$/.test(identityDocument);
    if (!isDni && !isRuc) return errorToast("Ingresa un DNI de 8 dígitos o un RUC de 11 dígitos.");
    setExternalLookupLoading(true);
    try {
      const response = isDni
        ? await lookupClientByDni(identityDocument)
        : await lookupClientByRuc(identityDocument);
      const data: any = response.data;
      const raw = data.raw || {};
      const dniName = data.nombre_completo || [data.nombres || raw.nombres, data.apepat || raw.apepat, data.apemat || raw.apemat].filter(Boolean).join(" ");
      const name = isDni ? dniName : data.razon_social || data.nombre_comercial;
      setFreeForm((current) => ({
        ...current,
        receptor_nombre: name || current.receptor_nombre,
        receptor_direccion: data.direccion || current.receptor_direccion,
      }));
      successToast(`Datos del ${isDni ? "DNI" : "RUC"} obtenidos correctamente.`);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || `No se encontraron datos para ese ${isDni ? "DNI" : "RUC"}.`);
    } finally {
      setExternalLookupLoading(false);
    }
  };

  const submitMasivo = async () => {
    if (form.cliente_ids.length === 0) {
      errorToast("Selecciona al menos un cliente.");
      return;
    }

    try {
      const response = await emitirMasivo(form);
      const errores = response.data.filter((item) => !item.ok);
      if (errores.length > 0) {
        errorToast(
          `Proceso terminado con ${errores.length} error(es).`,
          errores[0]?.message || "Revisa los clientes sin RUC si emitiste factura."
        );
      } else {
        successToast("Comprobantes emitidos correctamente.");
      }
      setModalOpen(false);
      await loadComprobantes();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        Object.values(error?.response?.data?.errors || {})?.flat()?.[0] ||
        "Error al emitir comprobantes.";
      errorToast(String(message));
    }
  };

  const handleReenviar = async () => {
    try {
      const response = await reenviarPendientes();
      const fallidos = response.data.filter((item) => !item.ok);
      if (fallidos.length > 0) {
        errorToast(
          `${fallidos.length} comprobante(s) continuaron con error.`,
          fallidos[0]?.message || "Revisa la respuesta del facturador."
        );
      } else {
        successToast("Pendientes reenviados correctamente.");
      }
      await loadComprobantes();
    } catch {
      errorToast("No se pudieron reenviar los pendientes.");
    }
  };

  const handleSincronizarFacturador = async () => {
    setSyncLoading(true);
    try {
      const response = await sincronizarFacturador();
      const { consultados, actualizados, cdr_descargados, errores } = response.data;
      if (errores.length) {
        errorToast(
          `Sincronización parcial: ${actualizados} factura(s) actualizada(s), ${cdr_descargados} CDR descargado(s).`,
          errores[0].mensaje
        );
      } else {
        successToast(
          `Facturador sincronizado: ${actualizados} actualizada(s), ${cdr_descargados} CDR descargado(s) de ${consultados} comprobante(s).`
        );
      }
      await loadComprobantes();
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "No se pudieron sincronizar las facturas con el facturador.");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleOpenPdf = async (id: number) => {
    try {
      await openPdfFromFetcher(
        () => getComprobantePdf(id),
        "Generando PDF del comprobante..."
      );
    } catch (err: any) {
      errorToast(err.message || "No se pudo abrir el PDF del comprobante.");
    }
  };

  const handleOpenWhatsAppModal = (comprobante: ComprobanteResource) => {
    setWhatsAppComprobante(comprobante);
    setWhatsAppModalOpen(true);
  };

  const handleReview = (comprobante: ComprobanteResource) => {
    setRecoveryComprobante(comprobante);
    setRecoveryOpen(true);
  };

  const handleDownloadZip = async (comprobante: ComprobanteResource) => {
    try {
      const blob = await downloadComprobanteFile(comprobante.id, "zip");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${comprobante.numero}-SUNAT.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      errorToast("No se pudo descargar el ZIP devuelto por el facturador.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TitleComponent
          title={InvoicingTitle}
          subtitle={InvoicingDescription}
          icon={InvoicingIconName as any}
        />
        <div className="grid w-full shrink-0 gap-2 sm:grid-cols-2 md:w-[760px]">
            <Button variant="outline" className="w-full whitespace-nowrap" onClick={() => setFreeModalOpen(true)}>
              <Plus className="mr-2 size-4" />
              Crear comprobante libre
            </Button>
            <Button className="w-full whitespace-nowrap" onClick={() => setModalOpen(true)}>
              <Send className="mr-2 size-4" />
              Emisión masiva
            </Button>
            <Button variant="outline" className="w-full whitespace-nowrap" onClick={() => navigate("/empresa-emisora")}>
              Configurar emisor
            </Button>
            <Button variant="outline" className="w-full whitespace-nowrap" onClick={handleReenviar}>
              <RefreshCcw className="mr-2 size-4" />
              Reenviar pendientes
            </Button>
            <Button variant="outline" className="w-full whitespace-nowrap" onClick={handleSincronizarFacturador} disabled={syncLoading}>
              <RefreshCcw className={`mr-2 size-4 ${syncLoading ? "animate-spin" : ""}`} />
              {syncLoading ? "Sincronizando..." : "Sincronizar facturas"}
            </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Buscar por cliente, RUC o serie"
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numero</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado SUNAT</TableHead>
              <TableHead>Notificación WhatsApp</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : comprobantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Sin comprobantes
                </TableCell>
              </TableRow>
            ) : (
              comprobantes.map((comprobante) => (
                <TableRow key={comprobante.id}>
                  <TableCell className="font-semibold">
                    {comprobante.numero}
                  </TableCell>
                  <TableCell>
                    {comprobante.cliente ? getClientDisplayName(comprobante.cliente) : `${comprobante.receptor_nombre || "Receptor externo"} — ${comprobante.receptor_documento || "sin documento"}`}
                  </TableCell>
                  <TableCell>
                    {comprobante.tipo_documento === "F" ? "Factura" : "Boleta"}
                  </TableCell>
                  <TableCell>{comprobante.fecha_emision}</TableCell>
                  <TableCell>
                    {comprobante.moneda} {Number(comprobante.total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColor[comprobante.estado] || ""}>
                      {comprobante.estado_label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        comprobante.estado_envio_cliente === "enviado"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : comprobante.estado_envio_cliente === "error"
                          ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }
                    >
                      {comprobante.estado_envio_cliente_label || "Pendiente de notificación"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider delayDuration={100} disableHoverableContent>
                      <div className="flex justify-end items-center gap-1.5">
                        {/* 1. Ver PDF (Rojo) */}
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="size-8 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                              aria-label="Ver y descargar PDF"
                              onMouseLeave={(e) => e.currentTarget.blur()}
                              onClick={(e) => {
                                e.currentTarget.blur();
                                handleOpenPdf(comprobante.id);
                              }}
                            >
                              <PdfIcon className="size-4.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                            Ver PDF
                          </TooltipContent>
                        </Tooltip>

                        {/* 2. Enviar por WhatsApp (Verde) */}
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="size-8 rounded-full bg-[#43A047] hover:bg-[#388E3C] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                              aria-label="Enviar por WhatsApp"
                              onMouseLeave={(e) => e.currentTarget.blur()}
                              onClick={(e) => {
                                e.currentTarget.blur();
                                handleOpenWhatsAppModal(comprobante);
                              }}
                            >
                              <WhatsAppIcon className="size-4 text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                            Enviar WhatsApp
                          </TooltipContent>
                        </Tooltip>

                        {/* 3. Revisar / Detalle / Estado (Azul) o Error (Rojo carmesí) */}
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className={`size-8 rounded-full text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0 ${
                                comprobante.estado === "X"
                                  ? "bg-[#D32F2F] hover:bg-[#B71C1C] animate-pulse ring-2 ring-red-400"
                                  : "bg-[#1E88E5] hover:bg-[#1976D2]"
                              }`}
                              aria-label={comprobante.estado === "X" ? "Ver error y corregir factura" : "Revisar factura y respuesta SUNAT"}
                              onMouseLeave={(e) => e.currentTarget.blur()}
                              onClick={(e) => {
                                e.currentTarget.blur();
                                handleReview(comprobante);
                              }}
                            >
                              {comprobante.estado === "X" ? (
                                <AlertCircle className="size-4 text-white" />
                              ) : (
                                <Info className="size-4 text-white" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                            {comprobante.estado === "X" ? "Ver error y corregir" : "Detalle y respuesta API"}
                          </TooltipContent>
                        </Tooltip>

                        {/* 4. Descargar ZIP SUNAT (Naranja) */}
                        {(comprobante.zip_path || ["M", "T"].includes(comprobante.estado)) && (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                className="size-8 rounded-full bg-[#FB8C00] hover:bg-[#F57C00] text-white shadow-xs hover:shadow-md transition-all duration-150 hover:scale-110 active:scale-95 border-0 p-0"
                                aria-label="Descargar archivo ZIP firmado SUNAT"
                                onMouseLeave={(e) => e.currentTarget.blur()}
                                onClick={(e) => {
                                  e.currentTarget.blur();
                                  handleDownloadZip(comprobante);
                                }}
                              >
                                <ZipIcon className="size-4 text-white" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={6} className="font-medium shadow-md pointer-events-none">
                              Descargar ZIP SUNAT
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageSizeChange={setPageSize}
      />

      <WhatsAppComprobanteModal
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
        comprobante={whatsAppComprobante}
        onSuccess={loadComprobantes}
      />

      <ComprobanteRecoveryDialog
        open={recoveryOpen}
        onOpenChange={setRecoveryOpen}
        comprobante={recoveryComprobante}
        onSuccess={loadComprobantes}
      />

      <Dialog open={freeModalOpen} onOpenChange={setFreeModalOpen}>
        <DialogContent className="max-h-[92vh] w-[94vw] overflow-hidden p-0 sm:max-w-[1100px]">
          <DialogHeader>
            <div className="border-b px-6 py-5">
              <DialogTitle>Crear comprobante libre</DialogTitle>
              <DialogDescription>
                Emite una factura o boleta para cualquier cliente registrado, sin asociarla a un contrato o cuota.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(92vh-150px)] space-y-5 overflow-y-auto px-6 py-5">
            <section className="space-y-4 rounded-xl border bg-card/80 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label className="text-sm font-semibold">Receptor del comprobante</Label>
                  <p className="mt-1 text-xs text-muted-foreground">Busca por nombre, RUC o DNI. No necesitas cargar toda la lista.</p>
                </div>
                <div className="flex w-full rounded-lg border bg-muted/40 p-1 text-xs sm:w-auto">
                  <button type="button" className={`flex-1 rounded-md px-3 py-2 transition ${freeRecipientMode === "registered" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`} onClick={() => setFreeRecipientMode("registered")}>Cliente registrado</button>
                  <button type="button" className={`flex-1 rounded-md px-3 py-2 transition ${freeRecipientMode === "external" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`} onClick={() => setFreeRecipientMode("external")}>RUC/DNI externo</button>
                </div>
              </div>

              {freeRecipientMode === "registered" ? (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={freeClientQuery}
                    placeholder="Buscar cliente por nombre, RUC o DNI..."
                    className="h-11 pl-9"
                    onFocus={() => setFreeClientPickerOpen(true)}
                    onChange={(event) => {
                      setFreeClientQuery(event.target.value);
                      setFreeForm((current) => ({ ...current, cliente_id: undefined }));
                      setFreeClientPickerOpen(true);
                    }}
                  />
                  {freeClientPickerOpen && (
                    <>
                      <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Cerrar resultados" onClick={() => setFreeClientPickerOpen(false)} />
                      <div className="absolute left-0 right-0 top-12 z-20 max-h-64 overflow-y-auto rounded-lg border bg-popover p-1 shadow-xl">
                        {freeClientsFiltered.length === 0 ? (
                          <p className="px-3 py-4 text-center text-sm text-muted-foreground">No se encontraron clientes.</p>
                        ) : freeClientsFiltered.map((cliente) => (
                          <button
                            type="button"
                            key={cliente.id}
                            className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left hover:bg-accent"
                            onClick={() => {
                              setFreeForm((current) => ({ ...current, cliente_id: cliente.id }));
                              setFreeClientQuery(`${getClientDisplayName(cliente)} — ${cliente.ruc || "sin RUC"}`);
                              setFreeClientPickerOpen(false);
                            }}
                          >
                            <span className="min-w-0"><span className="block truncate text-sm font-medium">{getClientDisplayName(cliente)}</span><span className="block text-xs text-muted-foreground">RUC: {cliente.ruc || "Sin RUC"}</span></span>
                            {freeForm.cliente_id === cliente.id && <span className="text-primary">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {freeSelectedClient && !freeClientPickerOpen && <p className="mt-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">Seleccionado: <strong>{getClientDisplayName(freeSelectedClient)}</strong> · {freeSelectedClient.ruc || "sin RUC"}</p>}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex gap-2 lg:col-span-1"><Input placeholder="RUC (11) o DNI (8)" value={freeForm.receptor_documento || ""} onChange={(event) => setFreeForm((current) => ({ ...current, receptor_documento: event.target.value.replace(/\D/g, "").slice(0, 11) }))} /><Button type="button" variant="outline" size="icon" onClick={lookupExternalDocument} disabled={externalLookupLoading} title="Consultar RUC o DNI">{externalLookupLoading ? "…" : <Search className="size-4" />}</Button></div>
                  <Input className="lg:col-span-2" placeholder="Razón social o nombre (opcional)" value={freeForm.receptor_nombre || ""} onChange={(event) => setFreeForm((current) => ({ ...current, receptor_nombre: event.target.value }))} />
                  <Input placeholder="Dirección (opcional)" value={freeForm.receptor_direccion || ""} onChange={(event) => setFreeForm((current) => ({ ...current, receptor_direccion: event.target.value }))} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Factura: RUC de 11 dígitos. Boleta: DNI de 8 o RUC de 11 dígitos.</p>
            </section>

            <section className="grid gap-3 rounded-xl border bg-card/80 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
              <div className="space-y-2"><Label>Tipo de comprobante</Label><select value={freeForm.tipo_documento} onChange={(event) => updateFreeTipoDocumento(event.target.value as TipoDocumento)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="F">Factura</option><option value="B">Boleta</option></select></div>
              <div className="space-y-2"><Label>Serie</Label><Input value={freeForm.serie} onChange={(event) => setFreeForm((current) => ({ ...current, serie: event.target.value.toUpperCase() }))} /></div>
              <div className="space-y-2"><Label>Fecha de emisión</Label><Input type="date" value={freeForm.fecha_emision} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setFreeForm((current) => ({ ...current, fecha_emision: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Forma de pago</Label><select value={freeForm.forma_pago} onChange={(event) => setFreeForm((current) => ({ ...current, forma_pago: event.target.value as "C" | "D" }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="C">Contado</option><option value="D">Crédito</option></select></div>
            </section>

            <div className="rounded-xl border bg-card/80 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Detalles del comprobante</h3>
                  <p className="text-xs text-muted-foreground">Los precios se registran con IGV incluido.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addFreeDetail}><Plus className="mr-1 size-4" />Agregar detalle</Button>
              </div>
              <div className="space-y-3">
                {freeForm.detalles.map((detail, index) => (
                  <div key={index} className="grid gap-2 rounded-lg border bg-background/60 p-3 sm:grid-cols-[minmax(0,1fr)_100px_140px_175px_40px] sm:items-end">
                    <div className="space-y-1"><Label className="text-xs">Glosa / descripción</Label><Input value={detail.descripcion} onChange={(event) => updateFreeDetail(index, "descripcion", event.target.value)} placeholder="Servicio o producto" /></div>
                    <div className="space-y-1"><Label className="text-xs">Cantidad</Label><Input type="number" min="0.01" step="0.01" value={detail.cantidad} onChange={(event) => updateFreeDetail(index, "cantidad", Number(event.target.value))} /></div>
                    <div className="space-y-1"><Label className="text-xs">Precio unitario</Label><Input type="number" min="0.01" step="0.01" value={detail.precio_unitario} onChange={(event) => updateFreeDetail(index, "precio_unitario", Number(event.target.value))} /></div>
                    <div className="min-w-0 space-y-1"><Label className="text-xs">IGV</Label><select value={detail.tipo_igv || "10"} onChange={(event) => updateFreeDetail(index, "tipo_igv", event.target.value)} className="h-10 w-full min-w-0 rounded-md border bg-background px-2 text-xs whitespace-nowrap"><option value="10">Gravado 18%</option><option value="20">Exonerado</option><option value="30">Inafecto</option></select></div>
                    <Button type="button" variant="ghost" size="icon" disabled={freeForm.detalles.length === 1} onClick={() => removeFreeDetail(index)} title="Eliminar detalle"><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setFreeModalOpen(false)}>Cancelar</Button>
            <Button onClick={submitComprobanteLibre} disabled={freeLoading}>{freeLoading ? "Emitiendo..." : "Crear y emitir"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[92vh] w-[94vw] overflow-hidden p-0 sm:max-w-[1180px]">
          <DialogHeader>
            <div className="border-b px-6 py-5">
              <DialogTitle>Emision masiva</DialogTitle>
              <DialogDescription>
                Genera un comprobante por cada cliente seleccionado.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid max-h-[calc(92vh-152px)] gap-5 overflow-y-auto px-6 py-5 xl:grid-cols-[460px_1fr]">
            <div className="space-y-4 rounded-xl border bg-card/80 p-5">
              <div>
                <h3 className="text-base font-semibold">Datos del comprobante</h3>
                <p className="text-sm text-muted-foreground">
                  Define el documento que se emitira para todos los clientes.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select
                    value={form.tipo_documento}
                    onChange={(event) =>
                      updateTipoDocumento(event.target.value as TipoDocumento)
                    }
                    className="h-10 w-full rounded-md border bg-background px-3"
                  >
                    <option value="F">Factura</option>
                    <option value="B">Boleta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Serie</Label>
                  <Input
                    value={form.serie}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        serie: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Forma de pago</Label>
                  <select
                    value={form.forma_pago}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        forma_pago: event.target.value as "C" | "D",
                      }))
                    }
                    className="h-10 w-full rounded-md border bg-background px-3"
                  >
                    <option value="C">Contado</option>
                    <option value="D">Credito</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Input
                    value={form.moneda}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        moneda: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripcion / glosa</Label>
                <Input
                  placeholder="Glosa o descripcion del servicio a facturar"
                  value={form.detalles[0].descripcion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      detalles: [
                        {
                          ...current.detalles[0],
                          descripcion: event.target.value,
                        },
                      ],
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.detalles[0].cantidad}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        detalles: [
                          {
                            ...current.detalles[0],
                            cantidad: Number(event.target.value),
                          },
                        ],
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio unitario (IGV incluido)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.detalles[0].precio_unitario}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        detalles: [
                          {
                            ...current.detalles[0],
                            precio_unitario: Number(event.target.value),
                          },
                        ],
                      }))
                    }
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-lg border bg-background/60 p-3 text-sm">
                <Checkbox
                  className="mt-0.5"
                  checked={form.emitir}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      emitir: checked === true,
                    }))
                  }
                />
                <span className="grid gap-1">
                  <span className="font-medium">Emitir al guardar</span>
                  <span className="text-xs text-muted-foreground">
                    Si se desactiva, solo se crea el comprobante pendiente.
                  </span>
                </span>
              </label>
            </div>

            <div className="space-y-4 rounded-xl border bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Clientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Para facturas solo se habilitan clientes con RUC valido.
                    {clientesNoFacturados > 0 && ` ${clientesNoFacturados} cliente(s) con “No facturado” fueron excluidos.`}
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedClientes.length} seleccionado(s)
                </Badge>
              </div>
              <div className="grid max-h-[520px] gap-3 overflow-auto pr-1 lg:grid-cols-2">
                {clientesVisibles.map((cliente) => {
                  return (
                    <label
                      key={cliente.id}
                      className="flex min-h-[92px] items-start gap-3 rounded-lg border bg-background/60 p-4 text-sm transition-colors hover:bg-sidebar"
                    >
                      <Checkbox
                        checked={form.cliente_ids.includes(cliente.id)}
                        onCheckedChange={() => toggleCliente(cliente.id)}
                      />
                      <span className="grid gap-1">
                        <span className="font-semibold">
                          {getClientDisplayName(cliente)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          RUC: {cliente.ruc || "Sin RUC"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitMasivo}>Emitir comprobantes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
