"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { notificationSchemaCreate } from "../lib/notification.schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractResource } from "@/pages/contract/lib/contract.interface";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import { useEffect } from "react";

// 1) Tipo fuerte del formulario = OUTPUT del schema de create
type ContractFormValues = z.output<typeof notificationSchemaCreate>;

interface ContractFormProps {
  defaultValues: Partial<ContractFormValues>;
  onSubmit: (data: ContractFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  contract: ContractResource | null;
}

export const NotificationForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  contract,
}: ContractFormProps) => {
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(notificationSchemaCreate),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  useEffect(() => {
    form.trigger();
  }, [contract]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col gap-4 bg-modal p-4 rounded-lg">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <FormField
              control={control}
              name="contrato_id"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2 hidden">
                  <FormLabel>Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="Contrato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input
                  disabled
                  placeholder="Cliente"
                  value={
                    contract?.cliente.razon_social ??
                    contract?.cliente.dueno_nombre
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={control}
              name="detalle"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mensaje" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="overflow-x-auto w-full flex">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Situación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract?.cuotas.map((cuota, index) => (
                  <TableRow key={cuota.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {format(
                        parse(
                          cuota.fecha_vencimiento.split("T")[0],
                          "yyyy-MM-dd",
                          new Date()
                        ),
                        "dd/MM/yyyy"
                      )}
                    </TableCell>
                    <TableCell>{cuota.monto}</TableCell>
                    <TableCell>{cuota.situacion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* <code>{JSON.stringify(form.formState.errors)}</code> */}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Enviando" : "Enviar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
