"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, Home, Wrench, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const router = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/5"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-background/90 backdrop-blur-xs border border-primary/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 relative">
              <div className="w-32 h-32 bg-secondary/10 rounded-full flex items-center justify-center">
                <Construction className="w-16 h-16 text-secondary" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>

            <CardTitle className="text-4xl font-bold text-primary mb-4">
              Página en Desarrollo
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Esta funcionalidad está siendo desarrollada y estará disponible
              próximamente.
            </p>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="bg-primary/5 rounded-lg p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-secondary" />
                <h3 className="text-lg font-semibold text-primary">
                  Estado del Desarrollo
                </h3>
              </div>
              <p className="text-gray-600">
                Nuestro equipo está trabajando activamente en esta
                característica. Te notificaremos cuando esté lista para usar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router("/")}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                ¿Necesitas ayuda? Contacta a nuestro equipo de soporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
