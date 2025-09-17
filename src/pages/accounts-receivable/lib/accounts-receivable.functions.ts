import { SituacionCuota } from "./accounts-receivable.interface";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export function castSituacionCuota(situacion: SituacionCuota) {
  switch (situacion) {
    case "pendiente":
      return "Pendiente";
    case "pagado":
      return "Pagado";
    case "vencido":
      return "Vencido";
    default:
      return situacion;
  }
}

export function getIconBySituacion(situacion: SituacionCuota) {
  switch (situacion) {
    case "pendiente":
      return Clock;
    case "pagado":
      return CheckCircle;
    case "vencido":
      return AlertCircle;
    default:
      return null;
  }
}

export function getSituacionColor(situacion: SituacionCuota) {
  switch (situacion) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "pagado":
      return "bg-green-100 text-green-800 border-green-300";
    case "vencido":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export function getSituacionVariant(situacion: SituacionCuota) {
  switch (situacion) {
    case "pendiente":
      return "secondary" as const;
    case "pagado":
      return "default" as const;
    case "vencido":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}
