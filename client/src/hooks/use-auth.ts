import { useState, useEffect } from "react";
import { User, getStoredUser, storeUser, clearStoredUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const loginUser = (userData: User) => {
    setUser(userData);
    storeUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
    clearStoredUser();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginUser,
    logout: logoutUser,
  };
}
