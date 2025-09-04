"use contract";

import { errorToast, successToast } from "@/lib/core.function";
import { ContractSchema, ContractUpdate } from "../lib/contract.schema.ts";
import {
  ContractIconName,
  ContractResource,
  ContractRoute,
  ContractTitle,
} from "../lib/contract.interface.ts";
import NotFound from "@/components/not-found";
import { ContractForm } from "./ContractForm.tsx";
import { useContractStore } from "../lib/contract.store.ts";
import { useContract } from "../lib/contract.hook.ts";
import { useNavigate, useParams } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent.tsx";
import FormSkeleton from "@/components/FormSkeleton.tsx";
import { format, parse } from "date-fns";

export default function ContractEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();

  if (!id || isNaN(Number(id))) {
    return <NotFound />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: contract, isFinding } = useContract(Number(id));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isSubmitting, updateContract } = useContractStore();

  const handleSubmit = async (data: ContractSchema) => {
    await updateContract(Number(id), data)
      .then(() => {
        successToast("Contrato actualizado exitosamente");
        router(ContractRoute);
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el contrato");
      });
  };

  const mapContractToForm = (
    data: ContractResource
  ): Partial<ContractUpdate> => ({
    fecha_inicio: format(
      parse(
        data.fecha_inicio.split("T").shift() || "",
        "yyyy-MM-dd",
        new Date()
      ),
      "yyyy-MM-dd"
    ),
    fecha_fin: format(
      parse(data.fecha_fin.split("T").shift() || "", "yyyy-MM-dd", new Date()),
      "yyyy-MM-dd"
    ),
    numero: data.numero,
    cliente_id: data.cliente.id.toString(),
    tipo_contrato: data.tipo_contrato,
    total: Number(data.total),
    forma_pago: data.forma_pago,
    productos_modulos: data.contrato_producto_modulos.map((item) => ({
      id: item.id,
      modulo_id: item.modulo_id,
      producto_id: item.producto_id,
      precio: Number(item.precio),
    })),
    cuotas: data.cuotas.map((item) => ({
      id: item.id,
      monto: Number(item.monto),
      fecha_vencimiento: format(
        parse(
          item.fecha_vencimiento.split("T").shift() || "",
          "yyyy-MM-dd",
          new Date()
        ),
        "yyyy-MM-dd"
      ),
    })),
  });

  if (isFinding) return <FormSkeleton />;

  if (!contract) return <NotFound />;

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      <TitleFormComponent
        title={ContractTitle}
        mode="edit"
        icon={ContractIconName}
      />
      <ContractForm
        defaultValues={mapContractToForm(contract)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="update"
        onCancel={() => router(ContractRoute)}
      />
    </div>
  );
}
