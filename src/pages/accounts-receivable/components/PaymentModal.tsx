"use client";

import { errorToast, successToast } from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";
import { GeneralModal } from "@/components/GeneralModal";
import { useCuentasPorCobrarStore } from "../lib/accounts-receivable.store";
import { useCuentaPorCobrar } from "../lib/accounts-receivable.hook";
import { PagoSchema } from "../lib/accounts-receivable.schema";
import { PagoForm } from "./PaymentForm";

export default function PagoModal({
  cuotaId,
  open,
  setOpen,
  onSuccess,
}: {
  cuotaId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  if (!cuotaId) return <NotFound />;

  const { data: cuentaPorCobrar, isFinding } = useCuentaPorCobrar(cuotaId);
  const { isSubmitting, createPago } = useCuentasPorCobrarStore();

  const handleSubmit = async (data: PagoSchema & { comprobante?: File }) => {
    await createPago(data)
      .then(() => {
        setOpen(false);
        successToast("Pago registrado exitosamente");
        onSuccess?.();
      })
      .catch((error) => {
        errorToast(
          error?.response?.data?.message || "Hubo un error al registrar el pago"
        );
      });
  };

  const montoPorPagar = Number(
    (
      (cuentaPorCobrar?.monto || 0) -
      (cuentaPorCobrar?.pagos_cuota?.reduce(
        (acc, pago) => acc + pago.monto_pagado,
        0
      ) || 0)
    ).toFixed(2)
  );

  if (!isFinding && !cuentaPorCobrar) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Registrar Pago"
      subtitle="Registra el pago de la cuota seleccionada"
      maxWidth="!max-w-(--breakpoint-lg)"
    >
      {isFinding || !cuentaPorCobrar ? (
        <FormSkeleton />
      ) : (
        <PagoForm
          defaultValues={{
            cuota_id: cuotaId,
            fecha_pago: new Date().toISOString().split("T")[0],
            monto_pagado: montoPorPagar,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
          cuota={cuentaPorCobrar}
        />
      )}
    </GeneralModal>
  );
}
