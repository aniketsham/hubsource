"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "../types";

export interface AuthUser extends User {
  likes: string[];
  saves: string[];
  following: string[];
  followers: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  patchUserLikes: (likes: string[]) => void;
  patchUserSaves: (saves: string[]) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  patchUserLikes: () => {},
  patchUserSaves: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${stored}` },
      });
      if (!res.ok) {
        logout();
        return;
      }
      const data = await res.json();
      setToken(stored);
      setUser({
        ...data,
        likes: data.likes ?? [],
        saves: data.saves ?? [],
        following: data.following ?? [],
        followers: data.followers ?? [],
      });
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const patchUserLikes = useCallback((likes: string[]) => {
    setUser((prev) => (prev ? { ...prev, likes } : prev));
  }, []);

  const patchUserSaves = useCallback((saves: string[]) => {
    setUser((prev) => (prev ? { ...prev, saves } : prev));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        logout,
        refreshUser,
        patchUserLikes,
        patchUserSaves,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
