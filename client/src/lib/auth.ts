import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  bio?: string;
  location?: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data.user;
}

export async function register(userData: RegisterData): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  const data = await response.json();
  return data.user;
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function storeUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem("user");
}
