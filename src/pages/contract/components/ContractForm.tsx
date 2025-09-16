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
    isValid,

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
    generateInstallments,
    adjustExistingInstallments,
    currentInstallmentsSum,
    isInstallmentsUnbalanced,

    // Watch values
    paymentMethod,
    total,
    fechaInicio,
    fechaFin,
  } = useContractForm({ defaultValues, mode });

  if (isLoading || !clients) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Layout Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Columna Izquierda - Información del Contrato y Productos */}
          <div className="xl:col-span-2 space-y-6">
            <ContractBasicInfo control={control} clients={clients} />

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
          </div>

          {/* Columna Derecha - Todo lo relacionado con Pagos */}
          <div className="xl:col-span-1">
            <PaymentSidebar
              control={control}
              paymentMethod={paymentMethod}
              total={total}
              fieldsLength={fields.length}
              sum={sum}
              manualSum={manualSum}
              cuotaFields={cuotaFields}
              numberOfInstallments={numberOfInstallments}
              setNumberOfInstallments={setNumberOfInstallments}
              generateInstallments={generateInstallments}
              appendCuota={appendCuota}
              adjustExistingInstallments={adjustExistingInstallments}
              isInstallmentsUnbalanced={isInstallmentsUnbalanced}
              currentInstallmentsSum={currentInstallmentsSum}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
          </div>
        </div>

        {/* Tabla de Cuotas - Full Width solo cuando hay muchas cuotas */}
        <InstallmentsTable
          control={control}
          cuotaFields={cuotaFields}
          removeCuota={removeCuota}
          total={total}
          currentInstallmentsSum={currentInstallmentsSum}
          onTrigger={() => form.trigger("cuotas")}
        />

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
            disabled={isSubmitting || !isValid}
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
