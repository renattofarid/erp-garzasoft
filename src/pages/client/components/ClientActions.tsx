"use client";

import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClientAddRoute } from "../lib/client.interface.ts";

export default function  ClientActions() {
  const router = useNavigate();

  const handleAddClient = () => {
    router(ClientAddRoute);
  };
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="!px-10" onClick={handleAddClient}>
        <Plus className="size-4 mr-2" /> Agregar
      </Button>
    </div>
  );
}
