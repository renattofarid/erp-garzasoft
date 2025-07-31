"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login } from "../lib/auth.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  username: z
    .string()
    .nonempty("El usuario no puede estar vacío")
    .max(50, "El usuario no puede tener más de 50 caracteres"),
  password: z
    .string()
    .nonempty("La contraseña no puede estar vacía")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await login({
        usuario: data.username,
        password: data.password,
      });

      console.log("Inicio de sesión exitoso:", response);
      successToast("Inicio de sesión exitoso");
      navigate("/inicio");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al iniciar sesión.";
      console.log("Error al iniciar sesión:", errorMessage);
      console.error("Detalles del error:", error);
      errorToast("Error al iniciar sesión", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEFFE] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#B6C3FF]">
          {/* Profile Icon and Branding */}
          <div className="text-start mb-8">
            <div className="text-base font-semibold font-nunito text-primary mb-1">
              Mr. Soft
            </div>
            <div className="text-xs text-secondary font-nunito">ERP System</div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="flex justify-start text-black text-lg font-extrabold font-nunito text-center mb-6">
                Iniciar sesión
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-black font-nunito">
                        Usuario
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresa usuario"
                          className="h-11 text-sm text-black border-gray-200 rounded-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-black font-nunito">
                        Contraseña
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="h-11 text-sm text-black border-gray-200 rounded-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-primary" />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
