"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type User = {
  id?: number;
  email?: string;
  enabled?: boolean;
  notionWorkspaceName?: string;
  notionWorkspaceIcon?: string;
  notionTargetDatabaseId?: string;
  notionTargetDatabaseName?: string;
  requestsInCurrentDay?: number;
  requestsInCurrentMonth?: number;
  planRefreshDate?: string;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (token: string) => {
    localStorage.setItem("task_pilot_auth_token", token);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("task_pilot_auth_token");
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("task_pilot_auth_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = (await res.json()) as User;
        setUser(data);
      } else {
        logout(); // If the token is invalid, log out
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
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
