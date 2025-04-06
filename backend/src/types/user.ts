export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'STAFF' | 'USER';
} 