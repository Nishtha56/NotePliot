"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to get token from localStorage
  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("session_token");
  }, []);

  // Helper to store token
  const setToken = useCallback((token?: string) => {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("session_token", token);
    } else {
      localStorage.removeItem("session_token");
    }
  }, []);

  // Helper to construct headers with Bearer token if available
  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, [getToken]);

  // Fetch current authenticated user on app initialization
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to check auth status:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [getAuthHeaders]);

  const login = async (email: string, password: string): Promise<User> => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
    } catch (err: unknown) {
      throw new Error(`Unable to connect to auth server at ${API_BASE}. Please verify that the FastAPI backend is running.`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Sign in failed. Please check your credentials.");
    }

    if (data.session_token) {
      setToken(data.session_token);
    }
    setUser(data.user);
    return data.user;
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
    } catch (err: unknown) {
      throw new Error(`Unable to connect to auth server at ${API_BASE}. Please verify that the FastAPI backend is running.`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Sign up failed. Please check your input.");
    }

    if (data.session_token) {
      setToken(data.session_token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setToken(undefined);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        setUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
