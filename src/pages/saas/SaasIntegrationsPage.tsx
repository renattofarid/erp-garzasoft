import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/config";
import { getAllClients } from "@/pages/client/lib/client.actions";
import { ClientResource } from "@/pages/client/lib/client.interface";
import { errorToast, successToast } from "@/lib/core.function";

type Branch = { id: number; cliente_id: number; external_branch_id: string; branch_name: string; active: boolean; cliente?: { razon_social?: string; nombre_comercial?: string } };
type Alert = { branch_id: number; cliente: string; branch_name: string; overdue_quotas: number; days_threshold: number; message: string };

export default function SaasIntegrationsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [clients, setClients] = useState<ClientResource[]>([]);
  const [settings, setSettings] = useState({ days_before_due: 3, suspension_alert_days: 7 });
  const [form, setForm] = useState({ cliente_id: "", external_branch_id: "", branch_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [branchResponse, alertResponse, settingResponse, allClients] = await Promise.all([
        api.get<{ data: Branch[] }>("saas/hotelhub/branches"),
        api.get<{ data: Alert[] }>("saas/hotelhub/alerts"),
        api.get<{ data: typeof settings }>("saas/payment-notice-settings"),
        getAllClients(),
      ]);
      setBranches(branchResponse.data.data);
      setAlerts(alertResponse.data.data);
      setSettings(settingResponse.data.data);
      setClients(allClients);
    } catch {
      errorToast("No se pudieron cargar las integraciones SaaS.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const createBranch = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("saas/hotelhub/branches", { ...form, cliente_id: Number(form.cliente_id) });
      setForm({ cliente_id: "", external_branch_id: "", branch_name: "" });
      successToast("Sucursal vinculada con HotelHUB.");
      await load();
    } catch { errorToast("No se pudo vincular la sucursal. Verifica el ID externo y el cliente."); }
    finally { setSaving(false); }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.put("saas/payment-notice-settings", settings);
      successToast("Reglas de avisos actualizadas.");
    } catch { errorToast("No se pudieron guardar las reglas."); }
  };

  const setStatus = async (branch: Branch, active: boolean) => {
    const action = active ? "reactivar" : "desactivar";
    if (!window.confirm(`¿Deseas ${action} la sucursal ${branch.branch_name} en HotelHUB?`)) return;
    try {
      await api.patch(`saas/hotelhub/branches/${branch.id}/status`, { active });
      successToast(`Sucursal ${active ? "reactivada" : "desactivada"} en HotelHUB.`);
      await load();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      errorToast(message || "HotelHUB no confirmó el cambio; el ERP conservó el estado anterior.");
    }
  };

  const name = (client: ClientResource) => client.razon_social || client.nombre_comercial || `Cliente ${client.id}`;

  return <div className="space-y-6">
    <TitleComponent title="Integraciones SaaS" subtitle="Gestiona HotelHUB, los avisos de pago y el acceso de sus sucursales." icon="Building2">
      <Button variant="outline" onClick={() => void load()}><RefreshCw className="mr-2 size-4" />Actualizar</Button>
    </TitleComponent>

    {alerts.length > 0 && <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
      <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-amber-600" />Revisión de suspensión</CardTitle><CardDescription>Cuotas con {alerts[0]?.days_threshold}+ días de atraso. El sistema no corta el acceso automáticamente.</CardDescription></CardHeader>
      <CardContent className="space-y-2">{alerts.map((alert) => <div key={alert.branch_id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3">
        <div><strong>{alert.cliente} · {alert.branch_name}</strong><p className="text-sm text-muted-foreground">{alert.overdue_quotas} cuota(s) pendientes. {alert.message}</p></div>
        <Button variant="destructive" onClick={() => { const branch = branches.find((item) => item.id === alert.branch_id); if (branch) void setStatus(branch, false); }}>Desactivar sucursal</Button>
      </div>)}</CardContent>
    </Card>}

    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card><CardHeader><CardTitle>Sucursales HotelHUB vinculadas</CardTitle><CardDescription>Usa el ID numérico de la sucursal en HotelHUB. Cada vínculo identifica al cliente al que pertenecen sus cuotas.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p>Cargando…</p> : branches.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay sucursales vinculadas.</p> : branches.map((branch) => <div key={branch.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div><strong>{branch.cliente?.razon_social || branch.cliente?.nombre_comercial || `Cliente ${branch.cliente_id}`} · {branch.branch_name}</strong><p className="text-sm text-muted-foreground">Sucursal HotelHUB ID: {branch.external_branch_id} · {branch.active ? "Activa" : "Desactivada"}</p></div>
            <Button variant={branch.active ? "destructive" : "default"} onClick={() => void setStatus(branch, !branch.active)}>{branch.active ? "Desactivar" : "Reactivar"}</Button>
          </div>)}
          <form onSubmit={createBranch} className="grid gap-3 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">Cliente ERP<select required className="h-10 w-full rounded-md border bg-background px-3" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}><option value="">Selecciona cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{name(client)}</option>)}</select></label>
            <label className="space-y-1 text-sm">ID de sucursal HotelHUB<input required className="h-10 w-full rounded-md border bg-background px-3" value={form.external_branch_id} onChange={(e) => setForm({ ...form, external_branch_id: e.target.value })} placeholder="Ej. 12" /></label>
            <label className="space-y-1 text-sm md:col-span-2">Nombre de sucursal<input required className="h-10 w-full rounded-md border bg-background px-3" value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} placeholder="Hotel principal" /></label>
            <Button type="submit" disabled={saving} className="md:col-span-2">{saving ? "Guardando…" : "Vincular sucursal"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Avisos de pago</CardTitle><CardDescription>Los avisos aparecen al iniciar sesión en HotelHUB. Los pagos aprobados los detienen automáticamente.</CardDescription></CardHeader>
        <CardContent><form onSubmit={saveSettings} className="space-y-4">
          <label className="block space-y-1 text-sm">Aviso antes del vencimiento (días)<input type="number" min="0" max="90" className="h-10 w-full rounded-md border bg-background px-3" value={settings.days_before_due} onChange={(e) => setSettings({ ...settings, days_before_due: Number(e.target.value) })} /></label>
          <label className="block space-y-1 text-sm">Alerta para revisar suspensión (días de atraso)<input type="number" min="0" max="365" className="h-10 w-full rounded-md border bg-background px-3" value={settings.suspension_alert_days} onChange={(e) => setSettings({ ...settings, suspension_alert_days: Number(e.target.value) })} /></label>
          <p className="text-sm text-muted-foreground">Después del vencimiento, HotelHUB avisa del atraso. Al alcanzar este umbral, el ERP muestra una alerta y permite que tú decidas si desactivas la sucursal.</p>
          <Button type="submit">Guardar reglas</Button>
        </form></CardContent>
      </Card>
    </div>
  </div>;
}
