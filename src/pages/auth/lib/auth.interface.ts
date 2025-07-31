export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  tipo_usuario_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
}
