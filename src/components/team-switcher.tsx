"use client";

// import { Command } from "lucide-react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function TeamSwitcher() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link to="/inicio" aria-label="Ir al inicio" className="flex items-center gap-2">
              <img
                src="/windows11/Square150x150Logo.scale-400.png"
                alt="Mr. Soft Development"
                className="size-9 shrink-0 rounded-md object-cover"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-primary font-paytone-one">Mr. Soft</span>
                <span className="truncate text-xs">ERP System</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
