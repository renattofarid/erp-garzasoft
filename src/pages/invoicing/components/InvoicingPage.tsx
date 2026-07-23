import { useEffect, useMemo, useState } from "react";
import { Search, Send, RefreshCcw, FileText, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { getAllClients } from "@/pages/client/lib/client.actions";
import {
  ClientResource,
  getClientDisplayName,
} from "@/pages/client/lib/client.interface";
import {
  emitirMasivo,
  envioMasivoWhatsApp,
  getComprobantes,
  getComprobantePdf,
  reenviarPendientes,
} from "../lib/invoicing.actions";
import {
  ComprobanteResource,
  EmisionMasivaPayload,
  InvoicingDescription,
  InvoicingIconName,
  InvoicingTitle,
  TipoDocumento,
} from "../lib/invoicing.interface";
import { WhatsAppComprobanteModal } from "./WhatsAppComprobanteModal";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkWhatsAppLoading, setBulkWhatsAppLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppComprobante, setWhatsAppComprobante] =
    useState<ComprobanteResource | null>(null);

  const [comprobantes, setComprobantes] = useState<ComprobanteResource[]>([]);
  const [clientes, setClientes] = useState<ClientResource[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const pendingWhatsAppCount = useMemo(() => {
    return comprobantes.filter(
      (c) => !c.estado_envio_cliente || c.estado_envio_cliente === "pendiente" || c.estado_envio_cliente === "error"
    ).length;
  }, [comprobantes]);

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
    if (form.tipo_documento !== "F") {
      return clientes;
    }

    return clientes.filter((cliente) => /^\d{11}$/.test(cliente.ruc || ""));
  }, [clientes, form.tipo_documento]);

  const loadComprobantes = async () => {
    setLoading(true);
    try {
      const response = await getComprobantes({ page, search });
      setComprobantes(response.data || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch {
      errorToast("No se pudieron cargar los comprobantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComprobantes();
  }, [page, search]);

  useEffect(() => {
    getAllClients()
      .then(setClientes)
      .catch(() => errorToast("No se pudieron cargar los clientes."));
  }, []);

  useEffect(() => {
    if (form.tipo_documento !== "F") {
      return;
    }

    setForm((current) => ({
      ...current,
      cliente_ids: current.cliente_ids.filter((clienteId) =>
        clientes.some(
          (cliente) =>
            cliente.id === clienteId && /^\d{11}$/.test(cliente.ruc || "")
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
      await reenviarPendientes();
      successToast("Pendientes reenviados.");
      await loadComprobantes();
    } catch {
      errorToast("No se pudieron reenviar los pendientes.");
    }
  };

  const handleEnvioMasivoWhatsApp = async () => {
    try {
      setBulkWhatsAppLoading(true);
      const res = await envioMasivoWhatsApp();
      successToast(res.message || "Envío masivo por WhatsApp completado.");
      await loadComprobantes();
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "Error al realizar envío masivo por WhatsApp.");
    } finally {
      setBulkWhatsAppLoading(false);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TitleComponent
          title={InvoicingTitle}
          subtitle={InvoicingDescription}
          icon={InvoicingIconName as any}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/empresa-emisora")}>
            Configurar emisor
          </Button>
          <Button variant="outline" onClick={handleReenviar}>
            <RefreshCcw className="mr-2 size-4" />
            Reenviar pendientes
          </Button>
          <Button
            variant="outline"
            className="border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 gap-1.5"
            onClick={handleEnvioMasivoWhatsApp}
            disabled={bulkWhatsAppLoading}
          >
            <MessageSquare className="size-4 text-emerald-500" />
            {bulkWhatsAppLoading ? "Notificando..." : "Envío masivo WhatsApp"}
            {pendingWhatsAppCount > 0 && (
              <Badge className="bg-emerald-600 text-white rounded-full ml-1 px-1.5 py-0.2 text-[10px]">
                {pendingWhatsAppCount}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Send className="mr-2 size-4" />
            Emision masiva
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
              <TableHead>Error</TableHead>
              <TableHead className="text-right">Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : comprobantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
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
                    {getClientDisplayName(comprobante.cliente)}
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
                  <TableCell className="max-w-[200px] truncate text-red-400 text-xs">
                    {comprobante.error_envio_cliente || comprobante.error_text || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPdf(comprobante.id)}
                      >
                        <FileText className="mr-1 size-3.5" />
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
                        onClick={() => handleOpenWhatsAppModal(comprobante)}
                      >
                        <MessageSquare className="size-3.5 text-emerald-500" />
                        WhatsApp
                      </Button>
                    </div>
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
      />

      <WhatsAppComprobanteModal
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
        comprobante={whatsAppComprobante}
        onSuccess={loadComprobantes}
      />

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
                  <Label>Precio unitario</Label>
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
