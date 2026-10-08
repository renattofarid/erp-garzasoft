import { useEffect, useState } from "react";
import { BellRing, Loader2, Mail, Save } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/lib/core.function";
import { getPaymentNotificationSettings, savePaymentNotificationSettings } from "../lib/payment-notification.actions";

export default function PaymentNotificationSettingsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPaymentNotificationSettings().then((settings) => setEmail(settings.notification_email || "")).catch(() => errorToast("No se pudo cargar la configuración.")).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { errorToast("Ingresa un correo válido."); return; }
    setSaving(true);
    try { await savePaymentNotificationSettings(email.trim()); successToast("Configuración guardada."); } catch (error: any) { errorToast(error?.response?.data?.message || "No se pudo guardar la configuración."); } finally { setSaving(false); }
  };

  return <div className="space-y-6"><TitleComponent title="Configuración" subtitle="Administra los avisos que recibe tu equipo." icon="Settings2" /><div className="max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-xs"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BellRing className="h-5 w-5" /></div><div><h2 className="font-semibold">Avisos de pagos manuales</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Recibe un correo cada vez que un cliente envíe un comprobante. El mensaje incluirá un botón directo a la revisión.</p></div></div><div className="mt-7"><label className="mb-2 block text-sm font-medium">Correo de revisión</label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pagos@tuempresa.com" type="email" disabled={loading || saving} className="h-11 pl-9" /></div><p className="mt-2 text-xs text-muted-foreground">Déjalo vacío para desactivar estos avisos. El correo del cliente se tomará desde su ficha.</p></div><Button onClick={save} disabled={loading || saving} className="mt-6">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar configuración</Button></div></div>;
}
