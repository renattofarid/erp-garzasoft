"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notificationSchemaCreate } from "../lib/notifications.schema";

// 1) Tipo fuerte del formulario = OUTPUT del schema de create
type ContractFormValues = z.output<typeof notificationSchemaCreate>;

interface ContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  // mode?: "create" | "update";
}

export const ContractForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ContractFormProps) => {
  // 2) Schema de runtime tipado para el resolver como ZodType<ContractFormValues>
  

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(notificationSchemaCreate),
    defaultValues: {
      contrato_id: "",
      detalle: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;




  // const cuotasData = useAllProducts();

  // const { data: clients, isLoading } = useAllClients();



  // if (isLoading || !clients) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 bg-modal p-4 rounded-lg">
            <Label className="font-semibold mb-2 col-span-3">Cliente</Label>
          


            {/* <FormSelect
              control={control}
              label="Contrato"
              name="contrato_id"
              placeholder="Selecciona un contrato"
              options={contrato.map((contrato) => ({
                label: contrato.razon_social,
                value: contrato.id.toString(),
              }))}
            /> */}

         
          </div>


          <div className="grid grid-cols-2 gap-3 bg-modal p-4 rounded-lg">

            <FormItem className="col-span-2">
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting || !isValid}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
