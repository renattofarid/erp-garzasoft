import { errorToast, successToast } from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCuentasPorCobrarStore } from "../lib/accounts-receivable.store";
import { useCuentasPorCobrar } from "../lib/accounts-receivable.hook";
import {
  CuentasPorCobrarDescriptionAdd,
  CuentasPorCobrarTitle,
} from "../lib/accounts-receivable.interface";
import { CuentasPorCobrarForm } from "./AccountsReceivableForm";
import { CuentasPorCobrarSchema } from "../lib/accounts-receivable.schema";

export default function CuentasPorCobrarAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createCuentaPorCobrar } = useCuentasPorCobrarStore();
  const { refetch } = useCuentasPorCobrar();

  const handleSubmit = async (data: CuentasPorCobrarSchema) => {
    await createCuentaPorCobrar(data)
      .then(() => {
        setOpen(false);
        successToast("Cuenta por cobrar creada exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear la cuenta por cobrar");
      });
  };

  return (
    <>
      <Button size="sm" className="!px-10" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" />
        Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={CuentasPorCobrarTitle}
        subtitle={CuentasPorCobrarDescriptionAdd}
        maxWidth="!max-w-(--breakpoint-lg)"
      >
        <CuentasPorCobrarForm
          defaultValues={{
            contrato_id: 0,
            monto: 0,
            fecha_vencimiento: "",
            fecha_pago: null,
            situacion: "pendiente",
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
