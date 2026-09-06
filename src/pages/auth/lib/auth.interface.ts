export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  cliente_id?: number | null;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_usuario_id: number;
  tipos_usuario?: {
    id: number;
    nombre: string;
  } | null;
  cliente?: {
    id: number;
    tipo?: string | null;
    razon_social?: string | null;
    nombre_comercial?: string | null;
    nombre_cliente?: string | null;
    ruc?: string | null;
    direccion?: string | null;
    dueno_celular?: string | null;
    dueno_email?: string | null;
  } | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}
