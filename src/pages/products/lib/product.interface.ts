import { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingBag } from "lucide-react";

export const ProductIcon = ShoppingBag;
export const ProductRoute = "/productos";
export const ProductAddRoute = "/productos/agregar";
export const ProductEditRoute = "/productos/editar";
export const ProductIconName = "ShoppingBag";
export const ProductTitle = "Productos y servicios";
export const ProductDescription = "Gestiona los productos y servicios en el sistema.";
export const ProductDescriptionAdd =
  "Crea un nuevo servicio o producto con sus conceptos.";
export const ProductDescriptionEdit =
  "Edita un servicio o producto existente.";

export type ProductType = "servicio" | "producto";

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface FormatoAltaPortada {
  slogan?: string;
  telefono_soporte?: string;
  email_soporte?: string;
  web_url?: string;
  empresa_desarrollo?: string;
}

export interface FormatoAltaPresentacion {
  titulo?: string;
  descripcion?: string;
  caracteristicas?: string[];
  mensaje_agradecimiento?: string;
  firmante_nombre?: string;
  firmante_cargo?: string;
}

export interface FormatoAltaUsuario {
  usuario: string;
  clave: string;
}

export interface FormatoAltaPerfil {
  perfil: string;
  enlace?: string;
  usuarios: FormatoAltaUsuario[];
}

export interface FormatoAltaAcceso {
  titulo?: string;
  url_acceso?: string;
  url_mesero?: string;
  instrucciones?: string;
  perfiles?: FormatoAltaPerfil[];
}

export interface FormatoAltaSerie {
  tipo: string;
  serie: string;
}

export interface FormatoAltaFacturacion {
  titulo?: string;
  url_portal?: string;
  instrucciones?: string;
  series?: FormatoAltaSerie[];
  credenciales_contador?: FormatoAltaUsuario[];
}

export interface FormatoAltaVideo {
  titulo: string;
  url: string;
}

export interface FormatoAltaTutoriales {
  titulo?: string;
  plataforma?: string;
  canal?: string;
  nombre_playlist?: string;
  enlace_playlist?: string;
  videos?: FormatoAltaVideo[];
}

export interface FormatoAltaConfig {
  paper_size?: "letter" | "a4";
  html_content?: string;
  portada?: FormatoAltaPortada;
  presentacion?: FormatoAltaPresentacion;
  acceso?: FormatoAltaAcceso;
  facturacion?: FormatoAltaFacturacion;
  tutoriales?: FormatoAltaTutoriales;
}

export interface ProductResource {
  id: number;
  nombre: string;
  tipo: ProductType;
  descripcion: string | null;
  modulos: Modulo[];
  avisos_saas: any[];
  formato_alta?: FormatoAltaConfig | null;
  created_at: string;
  updated_at: string;
}

export interface Modulo {
  id: number;
  nombre: string;
  descripcion_contrato?: string | null;
  precio_unitario: number;
  precio_mensual: number;
  precio_anual: number;
  producto_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  contratos: any[];
}

export interface ProductResourceById {
  status: number;
  message: string;
  data: ProductResource;
}

export interface getProductProps {
  params?: Record<string, any>;
}
