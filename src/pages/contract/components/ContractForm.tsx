"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllProducts } from "@/pages/products/lib/product.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { ContractBasicInfo } from "./ContractBasicInfo";
import { ProductsSection } from "./ProductsSection";
import { PaymentSidebar } from "./PaymentSidebar";
import { InstallmentsTable } from "./InstallmentsTable";
import type { z } from "zod";
import { contractCreateSchema } from "@/pages/contract/lib/contract.schema";
import { useContractForm } from "../lib/useContractForm";

type ContractFormValues = z.output<typeof contractCreateSchema>;

interface ContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const ContractForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ContractFormProps) => {
  const { data: clients, isLoading } = useAllClients();
  const { data: productData } = useAllProducts();

  const {
    // Form
    form,
    control,
    handleSubmit,

    // Products
    fields,
    append,
    remove,
    open,
    setOpen,

    // Calculations
    sum,
    manualSum,
    recalculateSum,

    // Installments
    cuotaFields,
    appendCuota,
    removeCuota,
    numberOfInstallments,
    setNumberOfInstallments,
    setInstallmentsTouched,
    generateInstallments,
    adjustExistingInstallments,
    currentInstallmentsSum,
    isInstallmentsUnbalanced,

    // Watch values
    paymentMethod,
    contractType,
    vigenciaContrato,
    duracionAnios,
    total,
    fechaInicio,
    fechaFin,
  } = useContractForm({ defaultValues, mode });

  // Eliminamos la sobreescritura forzada de precios para respetar los montos personalizados y los guardados en el contrato
  if (isLoading || !clients) return <FormSkeleton />;

  console.log(currentInstallmentsSum);
  

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Layout Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Columna Izquierda - Información del Contrato y Productos */}
          <div className="xl:col-span-3 space-y-6">
            <ContractBasicInfo
              fechaInicio={fechaInicio}
              control={control}
              clients={clients}
              vigenciaContrato={vigenciaContrato}
              duracionAnios={duracionAnios}
              contractType={contractType}
            />

            {contractType === "saas" && (
              <ProductsSection
                control={control}
                fields={fields}
                append={append}
                remove={remove}
                open={open}
                setOpen={setOpen}
                products={productData || []}
                sum={sum}
                manualSum={manualSum}
                recalculateSum={recalculateSum}
              />
            )}
          </div>

          {/* Columna Derecha - Todo lo relacionado con Pagos */}
          <div className="xl:col-span-2 xl:col-start-4 xl:px-6 xl:border-l h-full space-y-4">
            <PaymentSidebar
              paymentMethod={paymentMethod}
              total={total}
              cuotaFields={cuotaFields}
              numberOfInstallments={numberOfInstallments}
              setNumberOfInstallments={setNumberOfInstallments}
              setInstallmentsTouched={setInstallmentsTouched}
              generateInstallments={generateInstallments}
              appendCuota={appendCuota}
              adjustExistingInstallments={adjustExistingInstallments}
              isInstallmentsUnbalanced={isInstallmentsUnbalanced}
              currentInstallmentsSum={currentInstallmentsSum || 0}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
            {paymentMethod === "parcial" && (
              <InstallmentsTable
                control={control}
                cuotaFields={cuotaFields}
                removeCuota={removeCuota}
                total={total}
                currentInstallmentsSum={currentInstallmentsSum || 0}
                onTrigger={() => form.trigger("cuotas")}
              />
            )}
          </div>
        </div>
        {/* <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando contrato..." : "Guardar contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
