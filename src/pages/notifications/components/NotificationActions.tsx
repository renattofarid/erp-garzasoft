"use client";

import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import { NotificationsAddRoute } from "../lib/notifications.interface";

export default function ContractActions() {
  return (
    <div className="flex items-center gap-2">
      <Link to={NotificationsAddRoute} className="flex items-center">
        <Button>Agregar Notificación</Button>
      </Link>
    </div>
  );
}
