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
};

type UserContextValue = {
  user: User | null;
  loading: boolean; // Add loading state
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // 2. Create the loading state, default to true
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    // It's good practice to ensure loading is true when a refresh starts
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
        console.log("data", data);

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
    // Hydrate from httpOnly session cookie on mount
    void refreshUser();
    // The dependency array should be empty to ensure this runs only once on mount.
  }, []);

  return (
    // 4. Provide the loading state through the context
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
