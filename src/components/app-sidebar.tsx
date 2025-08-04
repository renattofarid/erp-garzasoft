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
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { ProductRoute } from "@/pages/products/lib/product.interface";
import { ClientRoute } from "@/pages/client/lib/client.interface";

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
          url: ProductRoute,
          icon: ShoppingBag,
        },
        {
          title: "Clientes",
          url: ClientRoute,
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
  const { user } = useAuthStore();

  if (!user) {
    return null; // or a loading state, or redirect to login
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
