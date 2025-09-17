import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserSchema,
  metricSchemaCreate,
  metricSchemaUpdate,
} from "../lib/User.schema.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useTypeUsers } from "@/pages/type-users/lib/typeUser.hook.ts";
import { FormSelect } from "@/components/FormSelect.tsx";
import FormSkeleton from "@/components/FormSkeleton.tsx";

interface MetricFormProps {
  defaultValues: Partial<UserSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const UserForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: MetricFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? metricSchemaCreate : metricSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: typeUsers, isLoading } = useTypeUsers();

  if (isLoading) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="bg-modal rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1">
            <FormSelect
              control={form.control}
              name="tipo_usuario_id"
              label="Tipo de Usuario"
              placeholder="Selecciona el tipo"
              options={
                typeUsers?.map((type) => ({
                  label: type.nombre,
                  value: type.id.toString(),
                })) || []
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Nombres</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Apellidos
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Apellidos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Contraseña"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Usuario"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
