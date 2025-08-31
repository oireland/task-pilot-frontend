"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api";

export type Plan = {
  name: string;
  requestsPerDay: number;
  requestsPerMonth: number;
};

export type User = {
  id: number;
  email: string;
  enabled: boolean;
  notionWorkspaceName?: string;
  notionWorkspaceIcon?: string;
  notionTargetDatabaseId?: string;
  notionTargetDatabaseName?: string;
  requestsInCurrentDay: number;
  requestsInCurrentMonth: number;
  planRefreshDate: string;
  plan: Plan;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("task_pilot_access_token", accessToken);
    localStorage.setItem("task_pilot_refresh_token", refreshToken);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("task_pilot_access_token");
    localStorage.removeItem("task_pilot_refresh_token");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem("task_pilot_access_token");
    const refreshToken = localStorage.getItem("task_pilot_refresh_token");

    if (!accessToken || !refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get("/api/v1/users/me");
      setUser(data as User);
    } catch (error) {
      console.error("Failed to refresh user, logging out.", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
