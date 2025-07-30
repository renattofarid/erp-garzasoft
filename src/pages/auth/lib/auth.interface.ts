
export interface AuthResponse {
  access_token: string;
  user:         User;
}

export interface User {
  id:       number;
  username: string;
  personId: number;
  fullName: string;
  role:     string;
}
