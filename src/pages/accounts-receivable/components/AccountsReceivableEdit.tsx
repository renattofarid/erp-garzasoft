"use client";

import { errorToast, successToast } from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { GeneralModal } from "@/components/GeneralModal";
import { useCuentasPorCobrarStore } from "../lib/accounts-receivable.store";
import { useCuentaPorCobrar } from "../lib/accounts-receivable.hook";
import { CuentasPorCobrarSchema } from "../lib/accounts-receivable.schema";
import {
  CuentasPorCobrarDescriptionEdit,
  CuentasPorCobrarResource,
  CuentasPorCobrarTitle,
} from "../lib/accounts-receivable.interface";
import { format, parse } from "date-fns";
import { CuentasPorCobrarForm } from "./AccountsReceivableForm";

export default function CuentasPorCobrarEditPage({
  id,
  open,
  setOpen,
  onSuccess,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  if (!id) return <NotFound />;

  const { data: cuentaPorCobrar, isFinding } = useCuentaPorCobrar(id);
  const { isSubmitting, updateCuentaPorCobrar } = useCuentasPorCobrarStore();

  const handleSubmit = async (data: CuentasPorCobrarSchema) => {
    await updateCuentaPorCobrar(id, data)
      .then(() => {
        setOpen(false);
        successToast("Cuenta por cobrar actualizada exitosamente");
        onSuccess?.();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar la cuenta por cobrar");
      });
  };

  const mapCuentaPorCobrarToForm = (
    data: CuentasPorCobrarResource
  ): Partial<CuentasPorCobrarSchema> => ({
    contrato_id: data.contrato_id,
    monto: data.monto,
    fecha_vencimiento: format(
      parse(
        data.fecha_vencimiento.split("T").shift() || "",
        "yyyy-MM-dd",
        new Date()
      ),
      "yyyy-MM-dd"
    ),
    fecha_pago: data.fecha_pago
      ? format(
          parse(
            data.fecha_pago.split("T").shift() || "",
            "yyyy-MM-dd",
            new Date()
          ),
          "yyyy-MM-dd"
        )
      : undefined,
    situacion: data.situacion,
    pagos_cuota: data.pagos_cuota

  });
  

  if (!isFinding && !cuentaPorCobrar) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={CuentasPorCobrarTitle}
      subtitle={CuentasPorCobrarDescriptionEdit}
      maxWidth="!max-w-(--breakpoint-lg)"
    >
      {isFinding || !cuentaPorCobrar ? (
        <FormSkeleton />
      ) : (
       <>
        <CuentasPorCobrarForm
          defaultValues={mapCuentaPorCobrarToForm(cuentaPorCobrar)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />

      
       </>
      )}
    </GeneralModal>
  );
}
