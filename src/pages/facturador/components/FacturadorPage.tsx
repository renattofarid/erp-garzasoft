import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { errorToast, successToast } from "@/lib/core.function";
import { FacturadorDescription, FacturadorIconName, FacturadorTitle } from "../lib/facturador.interface";
import { facturadorSchema, FacturadorSchema } from "../lib/facturador.schema";
import { getActiveFacturador, saveActiveFacturador } from "../lib/facturador.actions";

const WSDL_ENDPOINTS = {
  wsdl_boleta: "http://157.245.85.164/facturacion/wsdl/wsdl_boleta_rc.php",
  wsdl_factura: "http://157.245.85.164/facturacion/wsdl/wsdl_factura_rc.php",
  wsdl_consulta: "http://157.245.85.164/facturacion/wsdl/wsdl_comprobantes.php",
  wsdl_bajas: "http://157.245.85.164/facturacion/wsdl/wsdl_comunicacionbajas.php",
  wsdl_resumen_boletas:
    "http://157.245.85.164/facturacion/wsdl/wsdl_resumenboletas.php",
} as const;

const defaultValues: FacturadorSchema = {
  ruc: "",
  razon_social: "",
  nombre_comercial: "MrSoft",
  direccion: "",
  usuario_sol: "",
  clave_sol: "",
  token: "",
  wsdl_factura: WSDL_ENDPOINTS.wsdl_factura,
  wsdl_boleta: WSDL_ENDPOINTS.wsdl_boleta,
  wsdl_consulta: WSDL_ENDPOINTS.wsdl_consulta,
  wsdl_bajas: WSDL_ENDPOINTS.wsdl_bajas,
  modo: "simulacion",
  porcentaje_igv: 18,
  activo: true,
};

export default function FacturadorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresaId, setEmpresaId] = useState("");

  const form = useForm<FacturadorSchema>({
    resolver: zodResolver(facturadorSchema),
    defaultValues,
    mode: "onChange",
  });

  const currentModo = form.watch("modo");

  useEffect(() => {
    getActiveFacturador()
      .then((response) => {
        if (response.data) {
          setEmpresaId(response.data.id ? String(response.data.id) : "");
          form.reset({
            ...defaultValues,
            ruc: response.data.ruc ?? "",
            razon_social: response.data.razon_social ?? "",
            nombre_comercial: response.data.nombre_comercial ?? defaultValues.nombre_comercial,
            direccion: response.data.direccion ?? "",
            usuario_sol: response.data.usuario_sol ?? "",
            clave_sol: response.data.clave_sol ?? "",
            token: response.data.token ?? "",
            wsdl_factura: WSDL_ENDPOINTS.wsdl_factura,
            wsdl_boleta: WSDL_ENDPOINTS.wsdl_boleta,
            wsdl_consulta: WSDL_ENDPOINTS.wsdl_consulta,
            wsdl_bajas: WSDL_ENDPOINTS.wsdl_bajas,
            porcentaje_igv: Number(response.data.porcentaje_igv ?? 18),
            activo: response.data.activo ?? true,
            modo: response.data.modo ?? "simulacion",
          });
        }
      })
      .catch(() => errorToast("No se pudo cargar la configuración del emisor."))
      .finally(() => setIsLoading(false));
  }, [form]);

  const modeBadge = useMemo(() => {
    return currentModo === "produccion" ? "Producción" : "Simulación";
  }, [currentModo]);

  const handleSubmit = async (data: FacturadorSchema) => {
    setIsSubmitting(true);
    try {
      await saveActiveFacturador({
        ...data,
        wsdl_factura: WSDL_ENDPOINTS.wsdl_factura,
        wsdl_boleta: WSDL_ENDPOINTS.wsdl_boleta,
        wsdl_consulta: WSDL_ENDPOINTS.wsdl_consulta,
        wsdl_bajas: WSDL_ENDPOINTS.wsdl_bajas,
      });
      successToast("Configuración del emisor guardada correctamente.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        Object.values(error?.response?.data?.errors || {})?.flat()?.[0] ||
        "No se pudo guardar la configuración del emisor.";
      errorToast(String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <TitleComponent
        title={FacturadorTitle}
        subtitle={FacturadorDescription}
        icon={FacturadorIconName as any}
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
          <CardHeader>
            <CardTitle>Datos fiscales y credenciales WSDL</CardTitle>
            <CardDescription>
              Este perfil será usado para emitir comprobantes de MrSoft usando el integrador WSDL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando configuración...
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FormLabel>ID de la empresa</FormLabel>
                      <Input value={empresaId} disabled placeholder="Se asigna automáticamente" />
                    </div>
                    <FormField
                      control={form.control}
                      name="ruc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RUC</FormLabel>
                          <FormControl>
                            <Input placeholder="2060..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="razon_social"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razón social</FormLabel>
                          <FormControl>
                            <Input placeholder="MRSOFT S.A.C." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección fiscal</FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección fiscal del emisor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="usuario_sol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario WSDL</FormLabel>
                          <FormControl>
                            <Input placeholder="Usuario WSDL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clave_sol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña WSDL</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Contraseña WSDL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="porcentaje_igv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IGV (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="modo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modo de emisión</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="simulacion">Simulación</option>
                              <option value="produccion">Producción</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                      <Loader2 className={`mr-2 size-4 ${isSubmitting ? "animate-spin" : "hidden"}`} />
                      {isSubmitting ? "Guardando" : "Guardar configuración"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),rgba(15,23,42,0.8))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentModo === "produccion" ? (
                  <ShieldCheck className="size-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="size-5 text-amber-400" />
                )}
                Estado del emisor
              </CardTitle>
              <CardDescription>
                Verificación rápida del perfil que saldrá a SUNAT.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Modo actual</span>
                <Badge variant={currentModo === "produccion" ? "default" : "outline"}>
                  {modeBadge}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>RUC</span>
                <span className="font-medium">{form.watch("ruc") || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Usuario WSDL</span>
                <span className="font-medium">{form.watch("usuario_sol") || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>IGV</span>
                <span className="font-medium">{form.watch("porcentaje_igv")}%</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-background/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Rutas WSDL internas</p>
                <p>Boleta: {WSDL_ENDPOINTS.wsdl_boleta}</p>
                <p>Factura: {WSDL_ENDPOINTS.wsdl_factura}</p>
                <p>Consulta: {WSDL_ENDPOINTS.wsdl_consulta}</p>
                <p>Bajas: {WSDL_ENDPOINTS.wsdl_bajas}</p>
                <p>Resumen boletas: {WSDL_ENDPOINTS.wsdl_resumen_boletas}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10">
            <CardHeader>
              <CardTitle>Checklist antes de emitir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Confirmar que el RUC y la razón social de MrSoft coincidan con SUNAT.</p>
              <p>2. Validar que el usuario y la contraseña WSDL sean los correctos.</p>
              <p>3. Las URLs WSDL ya quedan configuradas internamente para boleta, factura, consulta, bajas y resumen.</p>
              <p>4. Mantén este perfil activo como único emisor del sistema.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
