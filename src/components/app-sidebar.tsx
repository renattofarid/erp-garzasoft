"use client";

import {
  BookOpen,
  Box,
  Cog,
  LayoutGrid,
  MessageSquareText,
  Receipt,
  ShieldUser,
  ShoppingBag,
  Signature,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { TypeUserIcon } from "@/pages/type-users/lib/typeUser.interface";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: "Seguridad",
      url: "#",
      icon: ShieldUser,
      items: [
        {
          title: "Usuarios",
          url: "/usuarios",
          icon: Users,
        },
        {
          title: "Tipo Usuario",
          url: "/tipo-usuarios",
          icon: TypeUserIcon,
        },
      ],
    },
    {
      title: "Mantenimiento",
      url: "#",
      icon: Cog,
      items: [
        {
          title: "Productos",
          url: "#",
          icon: ShoppingBag,
        },
        {
          title: "Clientes",
          url: "#",
          icon: Receipt,
        },
        {
          title: "Mensajes",
          url: "#",
          icon: MessageSquareText,
        },
      ],
    },
    {
      title: "Ventas",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Contratos",
          url: "#",
          icon: Signature,
        },
        {
          title: "Inventario",
          url: "#",
          icon: Box,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
