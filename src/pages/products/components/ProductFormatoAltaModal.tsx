"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  FileSpreadsheet,
  Loader2,
  Plus,
  Save,
  Trash2,
  Youtube,
} from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorToast, successToast } from "@/lib/core.function";
import { openPdfFromFetcher } from "@/lib/pdf";
import {
  getFormatoAltaPdfBlob,
  getProductFormatoAlta,
  updateProductFormatoAlta,
} from "../lib/product.actions";
import { FormatoAltaConfig, ProductResource } from "../lib/product.interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResource | null;
}

export default function ProductFormatoAltaModal({
  open,
  onOpenChange,
  product,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FormatoAltaConfig>({});

  useEffect(() => {
    if (open && product) {
      setLoading(true);
      getProductFormatoAlta(product.id)
        .then((res) => {
          setConfig(res?.data?.formato_alta || {});
        })
        .catch(() => {
          errorToast("No se pudo cargar la configuración del formato de alta.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, product]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      await updateProductFormatoAlta(product.id, config);
      successToast("Formato de alta guardado exitosamente.");
    } catch {
      errorToast("Error al guardar el formato de alta.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!product) return;
    try {
      await openPdfFromFetcher(
        () => getFormatoAltaPdfBlob(product.id),
        `Generando Formato de Alta de ${product.nombre}...`
      );
    } catch (err: any) {
      errorToast(err.message || "No se pudo generar la vista previa del PDF.");
    }
  };

  // Helper mutations for nested arrays
  const updatePortada = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      portada: {
        ...prev.portada,
        [key]: value,
      },
    }));
  };

  const updatePresentacion = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      presentacion: {
        ...prev.presentacion,
        [key]: value,
      },
    }));
  };

  const addCaracteristica = () => {
    const current = config.presentacion?.caracteristicas || [];
    updatePresentacion("caracteristicas", [...current, ""]);
  };

  const updateCaracteristica = (index: number, val: string) => {
    const current = [...(config.presentacion?.caracteristicas || [])];
    current[index] = val;
    updatePresentacion("caracteristicas", current);
  };

  const removeCaracteristica = (index: number) => {
    const current = [...(config.presentacion?.caracteristicas || [])];
    current.splice(index, 1);
    updatePresentacion("caracteristicas", current);
  };

  const updateAcceso = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      acceso: {
        ...prev.acceso,
        [key]: value,
      },
    }));
  };

  const updateFacturacion = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      facturacion: {
        ...prev.facturacion,
        [key]: value,
      },
    }));
  };

  const updateTutoriales = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      tutoriales: {
        ...prev.tutoriales,
        [key]: value,
      },
    }));
  };

  const addVideo = () => {
    const current = config.tutoriales?.videos || [];
    updateTutoriales("videos", [
      ...current,
      { titulo: "Nuevo Tutorial 🎥", url: "https://youtu.be/" },
    ]);
  };

  const updateVideo = (index: number, field: "titulo" | "url", val: string) => {
    const current = [...(config.tutoriales?.videos || [])];
    current[index] = { ...current[index], [field]: val };
    updateTutoriales("videos", current);
  };

  const removeVideo = (index: number) => {
    const current = [...(config.tutoriales?.videos || [])];
    current.splice(index, 1);
    updateTutoriales("videos", current);
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Formato de Alta: ${product?.nombre || "Producto"}`}
    >
      <div className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/80">
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Configurador del Documento de Alta
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personaliza el contenido de las 8 páginas del PDF de alta (portada, accesos, series y tutoriales).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviewPdf}
              className="text-xs font-semibold gap-1.5 shadow-2xs hover:bg-primary hover:text-primary-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver PDF</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading}
              className="text-xs font-semibold gap-1.5 shadow-2xs"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Guardar</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Cargando plantilla...</span>
          </div>
        ) : (
          <Tabs defaultValue="portada" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full h-10 p-1 bg-muted/80">
              <TabsTrigger value="portada" className="text-xs font-medium">
                1. Portada
              </TabsTrigger>
              <TabsTrigger value="presentacion" className="text-xs font-medium">
                2. Presentación
              </TabsTrigger>
              <TabsTrigger value="acceso" className="text-xs font-medium">
                3. Accesos
              </TabsTrigger>
              <TabsTrigger value="facturacion" className="text-xs font-medium">
                4. Facturación
              </TabsTrigger>
              <TabsTrigger value="tutoriales" className="text-xs font-medium">
                5. Tutoriales
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PORTADA */}
            <TabsContent value="portada" className="space-y-4 pt-1 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Slogan / Subtítulo</Label>
                  <Input
                    value={config.portada?.slogan || ""}
                    onChange={(e) => updatePortada("slogan", e.target.value)}
                    placeholder="Ej. Tu restaurante digital"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Teléfono Soporte</Label>
                  <Input
                    value={config.portada?.telefono_soporte || ""}
                    onChange={(e) => updatePortada("telefono_soporte", e.target.value)}
                    placeholder="+51 979 293 176"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email Soporte</Label>
                  <Input
                    value={config.portada?.email_soporte || ""}
                    onChange={(e) => updatePortada("email_soporte", e.target.value)}
                    placeholder="soporte@empresa.com"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sitio Web</Label>
                  <Input
                    value={config.portada?.web_url || ""}
                    onChange={(e) => updatePortada("web_url", e.target.value)}
                    placeholder="www.gesrest.net"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Marca / Empresa Desarrolladora</Label>
                  <Input
                    value={config.portada?.empresa_desarrollo || ""}
                    onChange={(e) => updatePortada("empresa_desarrollo", e.target.value)}
                    placeholder="Mr. Soft"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: PRESENTACIÓN */}
            <TabsContent value="presentacion" className="space-y-4 pt-1 outline-none">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Título de Presentación</Label>
                  <Input
                    value={config.presentacion?.titulo || ""}
                    onChange={(e) => updatePresentacion("titulo", e.target.value)}
                    placeholder="PRESENTACIÓN"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Descripción General</Label>
                  <Textarea
                    rows={3}
                    value={config.presentacion?.descripcion || ""}
                    onChange={(e) => updatePresentacion("descripcion", e.target.value)}
                    placeholder="Descripción del producto y qué módulos incluye..."
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Viñetas de Funcionalidades / Beneficios:
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCaracteristica}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar Viñeta</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(config.presentacion?.caracteristicas || []).map((caract, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={caract}
                          onChange={(e) => updateCaracteristica(idx, e.target.value)}
                          className="h-8 text-xs flex-1"
                          placeholder="Ej. Detalle de los productos que vendes."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCaracteristica(idx)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Firmante (Nombre)</Label>
                    <Input
                      value={config.presentacion?.firmante_nombre || ""}
                      onChange={(e) => updatePresentacion("firmante_nombre", e.target.value)}
                      placeholder="Gilberto Martín Ampuero Pasco"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Firmante (Cargo)</Label>
                    <Input
                      value={config.presentacion?.firmante_cargo || ""}
                      onChange={(e) => updatePresentacion("firmante_cargo", e.target.value)}
                      placeholder="CEO Mr. SOFT"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: ACCESOS Y CREDENCIALES */}
            <TabsContent value="acceso" className="space-y-4 pt-1 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">URL del Sistema / Login</Label>
                  <Input
                    value={config.acceso?.url_acceso || ""}
                    onChange={(e) => updateAcceso("url_acceso", e.target.value)}
                    placeholder="https://gesrest.net/"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Enlace para Mesero / Operativos</Label>
                  <Input
                    value={config.acceso?.url_mesero || ""}
                    onChange={(e) => updateAcceso("url_mesero", e.target.value)}
                    placeholder="https://sistema.gesrest.net/waiter-login"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold">Perfiles y Usuarios de Ejemplo:</Label>
                <div className="space-y-3">
                  {(config.acceso?.perfiles || []).map((p, pIdx) => (
                    <div key={pIdx} className="rounded-lg border p-3 bg-card/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={p.perfil}
                          onChange={(e) => {
                            const copy = [...(config.acceso?.perfiles || [])];
                            copy[pIdx].perfil = e.target.value;
                            updateAcceso("perfiles", copy);
                          }}
                          className="h-7 text-xs font-bold w-64 uppercase"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const copy = [...(config.acceso?.perfiles || [])];
                            copy[pIdx].usuarios.push({ usuario: "", clave: "" });
                            updateAcceso("perfiles", copy);
                          }}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="h-3 w-3" /> Agregar usuario
                        </Button>
                      </div>

                      {p.enlace !== undefined && (
                        <Input
                          value={p.enlace || ""}
                          onChange={(e) => {
                            const copy = [...(config.acceso?.perfiles || [])];
                            copy[pIdx].enlace = e.target.value;
                            updateAcceso("perfiles", copy);
                          }}
                          placeholder="Enlace específico del perfil..."
                          className="h-7 text-xs"
                        />
                      )}

                      <div className="space-y-1.5">
                        {p.usuarios.map((u, uIdx) => (
                          <div key={uIdx} className="flex items-center gap-2">
                            <Input
                              value={u.usuario}
                              onChange={(e) => {
                                const copy = [...(config.acceso?.perfiles || [])];
                                copy[pIdx].usuarios[uIdx].usuario = e.target.value;
                                updateAcceso("perfiles", copy);
                              }}
                              placeholder="Usuario"
                              className="h-7 text-xs flex-1"
                            />
                            <Input
                              value={u.clave}
                              onChange={(e) => {
                                const copy = [...(config.acceso?.perfiles || [])];
                                copy[pIdx].usuarios[uIdx].clave = e.target.value;
                                updateAcceso("perfiles", copy);
                              }}
                              placeholder="Clave"
                              className="h-7 text-xs flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const copy = [...(config.acceso?.perfiles || [])];
                                copy[pIdx].usuarios.splice(uIdx, 1);
                                updateAcceso("perfiles", copy);
                              }}
                              className="h-7 w-7 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: PORTAL DE FACTURACIÓN */}
            <TabsContent value="facturacion" className="space-y-4 pt-1 outline-none">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">URL Portal de Contador</Label>
                  <Input
                    value={config.facturacion?.url_portal || ""}
                    onChange={(e) => updateFacturacion("url_portal", e.target.value)}
                    placeholder="https://comprobante-e.com"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Configuración de Series:</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const copy = [...(config.facturacion?.series || [])];
                        copy.push({ tipo: "Serie nueva", serie: "F001" });
                        updateFacturacion("series", copy);
                      }}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar Serie</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(config.facturacion?.series || []).map((s, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <Input
                          value={s.tipo}
                          onChange={(e) => {
                            const copy = [...(config.facturacion?.series || [])];
                            copy[sIdx].tipo = e.target.value;
                            updateFacturacion("series", copy);
                          }}
                          placeholder="Tipo comprobante (ej. Serie factura)"
                          className="h-8 text-xs flex-1"
                        />
                        <Input
                          value={s.serie}
                          onChange={(e) => {
                            const copy = [...(config.facturacion?.series || [])];
                            copy[sIdx].serie = e.target.value;
                            updateFacturacion("series", copy);
                          }}
                          placeholder="F040"
                          className="h-8 text-xs w-32 font-mono uppercase font-bold text-center"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const copy = [...(config.facturacion?.series || [])];
                            copy.splice(sIdx, 1);
                            updateFacturacion("series", copy);
                          }}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: TUTORIALES DE YOUTUBE */}
            <TabsContent value="tutoriales" className="space-y-4 pt-1 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Canal YouTube</Label>
                  <Input
                    value={config.tutoriales?.canal || ""}
                    onChange={(e) => updateTutoriales("canal", e.target.value)}
                    placeholder="Mr Soft"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre Playlist</Label>
                  <Input
                    value={config.tutoriales?.nombre_playlist || ""}
                    onChange={(e) => updateTutoriales("nombre_playlist", e.target.value)}
                    placeholder="Gesrest - Software para restaurantes 🍴"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Enlace Playlist Principal</Label>
                  <Input
                    value={config.tutoriales?.enlace_playlist || ""}
                    onChange={(e) => updateTutoriales("enlace_playlist", e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=..."
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Youtube className="h-4 w-4 text-rose-500" />
                    Lista de Videos Tutoriales ({config.tutoriales?.videos?.length || 0}):
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVideo}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar Video</span>
                  </Button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(config.tutoriales?.videos || []).map((vid, vIdx) => (
                    <div key={vIdx} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border">
                      <span className="text-xs text-muted-foreground w-6 font-mono text-center">
                        {vIdx + 1}
                      </span>
                      <Input
                        value={vid.titulo}
                        onChange={(e) => updateVideo(vIdx, "titulo", e.target.value)}
                        placeholder="Título del video (ej. ¿Cómo aperturar caja? 💰)"
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        value={vid.url}
                        onChange={(e) => updateVideo(vIdx, "url", e.target.value)}
                        placeholder="https://youtu.be/..."
                        className="h-8 text-xs flex-1 font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVideo(vIdx)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="text-xs font-semibold gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
