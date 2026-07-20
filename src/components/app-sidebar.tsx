"use client";

import {
  BookOpen,
  Building2,
  Box,
  Cog,
  FileText,
  FolderOpen,
  LayoutGrid,
  MessageSquareText,
  ShieldUser,
  ShoppingBag,
  Signature,
  Store,
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
import {
  TypeUserIcon,
  TypeUserRoute,
  TypeUserTitle,
} from "@/pages/type-users/lib/typeUser.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { ProductRoute } from "@/pages/products/lib/product.interface";
import {
  ClientIcon,
  ClientRoute,
  ClientTitle,
} from "@/pages/client/lib/client.interface";
import { CuentasPorCobrarRoute } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { InvoicingRoute } from "@/pages/invoicing/lib/invoicing.interface";
import {
  LocalTypeRoute,
  LocalTypeTitle,
} from "@/pages/local-types/lib/localType.interface";
import {
  FacturadorRoute,
  FacturadorTitle,
} from "@/pages/facturador/lib/facturador.interface";

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
          title: TypeUserTitle,
          url: TypeUserRoute,
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
          title: ClientTitle,
          url: ClientRoute,
          icon: ClientIcon,
        },
        {
          title: LocalTypeTitle,
          url: LocalTypeRoute,
          icon: Store,
        },
        {
          title: "Mensajes",
          url: "/notificaciones",
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
          url: "/contratos",
          icon: Signature,
        },
        {
          title: "Cuentas por cobrar",
          url: CuentasPorCobrarRoute,
          icon: Box,
        },
        {
          title: "Facturacion electronica",
          url: InvoicingRoute,
          icon: FileText,
        },
        {
          title: FacturadorTitle,
          url: FacturadorRoute,
          icon: Building2,
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

  const isClient = Boolean(user.cliente_id);
  const items = isClient
    ? [
        {
          title: "Mi portal",
          url: "/inicio",
          icon: FolderOpen,
        },
      ]
    : data.navMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
