"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

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
  planRefreshDate?: string; // The backend's LocalDate becomes a string
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!loading) setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = (await res.json()) as User;
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
