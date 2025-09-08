"use client";

import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import { ContractAddRoute } from "../lib/contract.interface.ts";

export default function ContractActions() {
  return (
    <div className="flex items-center gap-2">
      <Link to={ContractAddRoute} className="flex items-center">
        <Button>Agregar Contrato</Button>
      </Link>
    </div>
  );
}
