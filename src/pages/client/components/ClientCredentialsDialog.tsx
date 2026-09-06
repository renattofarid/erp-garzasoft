import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorToast, successToast } from "@/lib/core.function";
import {
  getClientPortalUser,
  saveClientPortalUser,
} from "../lib/client.actions";
import { findClientById } from "../lib/client.actions";
import { getClientDisplayName } from "../lib/client.interface";

interface Props {
  clientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClientCredentialsDialog({
  clientId,
  open,
  onOpenChange,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clientName, setClientName] = useState("Cliente");
  const [exists, setExists] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [lastPassword, setLastPassword] = useState<string | null>(null);
  const [form, setForm] = useState({
    usuario: "",
    password: "",
    nombres: "",
    apellidos: "",
  });

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setLastPassword(null);
    setShowPassword(false);

    Promise.all([findClientById(clientId), getClientPortalUser(clientId)])
      .then(([clientResponse, userResponse]) => {
        const client = clientResponse.data;
        const portalUser = userResponse.data.usuario;
        const defaultName = getClientDisplayName(client);
        const defaultUser = client.ruc || client.contacto_principal?.dni || "";

        setClientName(defaultName);
        setExists(userResponse.data.exists);
        setPasswordMessage(userResponse.data.password_message);
        setForm({
          usuario: portalUser?.usuario || defaultUser,
          password: "",
          nombres: portalUser?.nombres || defaultName,
          apellidos: portalUser?.apellidos || "",
        });
      })
      .catch(() => errorToast("No se pudo cargar el acceso del cliente."))
      .finally(() => setLoading(false));
  }, [clientId, open]);

  const passwordHelp = useMemo(() => {
    if (lastPassword) {
      return `Nueva clave asignada: ${lastPassword}`;
    }

    return exists
      ? "Deja la clave vacia si no deseas cambiarla."
      : "Ingresa una clave para crear el acceso del cliente.";
  }, [exists, lastPassword]);

  const handleSave = async () => {
    if (!form.usuario.trim()) {
      errorToast("El usuario es obligatorio.");
      return;
    }

    if (!exists && !form.password.trim()) {
      errorToast("La clave es obligatoria para crear el acceso.");
      return;
    }

    setSaving(true);
    try {
      const response = await saveClientPortalUser(clientId, {
        usuario: form.usuario.trim(),
        password: form.password.trim() || undefined,
        nombres: form.nombres.trim() || undefined,
        apellidos: form.apellidos.trim(),
      });

      setExists(true);
      setLastPassword(response.data.password_visible);
      setPasswordMessage(response.data.password_message);
      setForm((current) => ({ ...current, password: "" }));
      successToast(response.message || "Acceso guardado correctamente.");
    } catch (error: any) {
      const message =
        Object.values(error?.response?.data?.errors || {})?.flat()?.[0] ||
        error?.response?.data?.message ||
        "No se pudo guardar el acceso.";
      errorToast(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Usuario y clave del cliente
          </DialogTitle>
          <DialogDescription>
            {clientName}. Puedes crear el acceso o resetear la clave del portal.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Cargando acceso...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {passwordMessage}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombres</Label>
                <Input
                  value={form.nombres}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nombres: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Apellidos</Label>
                <Input
                  value={form.apellidos}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      apellidos: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                value={form.usuario}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    usuario: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{exists ? "Nueva clave" : "Clave"}</Label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder={exists ? "No cambiar" : "Clave inicial"}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{passwordHelp}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            <Save className="mr-2 size-4" />
            {saving ? "Guardando..." : "Guardar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
