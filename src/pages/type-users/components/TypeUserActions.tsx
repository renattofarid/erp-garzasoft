"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TypeUserActions() {
  const router = useNavigate();

  const handleAddTypeUser = () => {
    router("/tipo-usuarios/agregar");
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="ml-auto px-10" onClick={handleAddTypeUser}>
        Agregar
      </Button>
    </div>
  );
}
