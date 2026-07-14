"use client";

import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContractCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { motivo_anulacion?: string; fecha_anulacion: string }) => Promise<void>;
}

const today = new Date().toISOString().slice(0, 10);

export function ContractCancelDialog({
  open,
  onOpenChange,
  onConfirm,
}: ContractCancelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(today);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({
        motivo_anulacion: motivo.trim() || undefined,
        fecha_anulacion: fecha,
      });
      setMotivo("");
      setFecha(today);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Anular contrato"
      subtitle="Registra el motivo y la fecha de anulacion."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de anulacion</label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Motivo</label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo opcional"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !fecha}>
            {loading ? "Anulando..." : "Confirmar anulacion"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
