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
            <Link to="/inicio" aria-label="Ir al inicio" className="flex items-center justify-center">
              <img
                src="/windows11/Wide310x150Logo.scale-400.png"
                alt="Mr. Soft Development"
                className="h-12 w-full object-contain"
              />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
