import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  profilePicture?: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
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
