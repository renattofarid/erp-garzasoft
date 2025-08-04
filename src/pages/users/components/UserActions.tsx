"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserActions() {
  const router = useNavigate();

  const handleAddUser = () => {
    router("/usuarios/agregar");
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="ml-auto px-10" onClick={handleAddUser}>
        Agregar
      </Button>
    </div>
  );
}
