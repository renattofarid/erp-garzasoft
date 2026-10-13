import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/config";
import { errorToast, successToast } from "@/lib/core.function";

export default function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (password !== confirmation) return errorToast("Las claves nuevas no coinciden.");
    setSaving(true);
    try {
      await api.post("auth/change-password", { password_actual: current, password, password_confirmation: confirmation });
      successToast("Clave actualizada correctamente.");
      setCurrent(""); setPassword(""); setConfirmation(""); onOpenChange(false);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || Object.values(error?.response?.data?.errors || {})?.flat()?.[0] || "No se pudo actualizar la clave.");
    } finally { setSaving(false); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-md">
    <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="size-5" />Cambiar mi clave</DialogTitle></DialogHeader>
    <div className="space-y-4">
      <div><Label>Clave actual</Label><Input type="password" value={current} onChange={e => setCurrent(e.target.value)} /></div>
      <div><Label>Nueva clave</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 10: mayúscula, minúscula, número y símbolo" /></div>
      <div><Label>Confirmar nueva clave</Label><Input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></div>
    </div>
    <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={submit} disabled={saving || !current || !password || !confirmation}>{saving ? "Guardando..." : "Actualizar clave"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
