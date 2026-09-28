"use client";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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
  currentContractId?: number;
}

export const ContractForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  currentContractId,
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
    dueDayType,
    setDueDayType,
    setInstallmentsTouched,
    generateInstallments,
    adjustExistingInstallments,
    currentInstallmentsSum,
    isInstallmentsUnbalanced,
    recalculateTotalFromInstallments,

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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={control}
          name="no_facturado"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <label className="flex cursor-pointer items-start gap-3">
                <FormControl>
                  <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(checked === true)} />
                </FormControl>
                <span className="grid gap-1">
                  <span className="font-semibold text-amber-900 dark:text-amber-100">No facturado</span>
                  <span className="text-sm text-amber-800/80 dark:text-amber-100/70">
                    Este contrato seguirá generando cuotas, deuda y pagos, pero será excluido de toda emisión de facturas.
                  </span>
                </span>
              </label>
            </FormItem>
          )}
        />
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
              currentContractId={currentContractId}
              installmentsTotal={currentInstallmentsSum || 0}
              hasInstallments={cuotaFields.length > 0}
              onRecalculateTotal={recalculateTotalFromInstallments}
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
              dueDayType={dueDayType}
              setDueDayType={setDueDayType}
              setInstallmentsTouched={setInstallmentsTouched}
              generateInstallments={generateInstallments}
              appendCuota={appendCuota}
              adjustExistingInstallments={adjustExistingInstallments}
              isInstallmentsUnbalanced={isInstallmentsUnbalanced}
              currentInstallmentsSum={currentInstallmentsSum || 0}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
            {(paymentMethod === "parcial" || paymentMethod === "unico") && (
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
