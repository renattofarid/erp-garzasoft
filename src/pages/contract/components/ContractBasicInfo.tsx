import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSelect } from "@/components/FormSelect";
import { Matcher } from "react-day-picker";
import { parse } from "date-fns";

interface Client {
  id: number;
  razon_social: string;
}

interface ContractBasicInfoProps {
  control: Control<any>;
  clients: Client[];
  fechaInicio: string;
}

export const ContractBasicInfo = ({
  control,
  clients,
  fechaInicio,
}: ContractBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Información del Contrato</h2>
          <p className="text-sm text-muted-foreground">
            Datos básicos y cliente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-modal border rounded-lg shadow-sm">
        <FormField
          control={control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Contrato<span className="text-red-500">*</span> </FormLabel>
              <FormControl>
                <Input placeholder="CT-2025-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSelect
          control={control}
          label="Cliente"
          name="cliente_id"
          placeholder="Selecciona un cliente"
          options={clients.map((client) => ({
            label: client.razon_social,
            value: client.id.toString(),
          }))}
        />

        <DatePickerFormField
          control={control}
          name="fecha_inicio"
          captionLayout="dropdown"
          dateFormat="dd/MM/yyyy"
          label="Fecha de Inicio"
          placeholder="Selecciona una fecha"
        />

        <DatePickerFormField
          control={control}
          name="fecha_fin"
          captionLayout="dropdown"
          dateFormat="dd/MM/yyyy"
          label="Fecha de Finalización"
          placeholder="Selecciona una fecha"
          disabledRange={
            {
              before: fechaInicio
                ? new Date(
                    parse(fechaInicio, "yyyy-MM-dd", new Date()).getTime() +
                      24 * 60 * 60 * 1000
                  )
                : undefined,
            } as Matcher
          }
        />

        <FormSelect
          control={control}
          label="Tipo de Contrato"
          name="tipo_contrato"
          placeholder="Selecciona un tipo"
          options={[
            { label: "Desarrollo a Medida", value: "desarrollo" },
            { label: "SaaS", value: "saas" },
            { label: "Soporte", value: "soporte" },
          ]}
        />
      </div>
    </div>
  );
};
