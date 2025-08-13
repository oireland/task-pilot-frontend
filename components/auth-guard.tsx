"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../hooks/use-user";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirection once the loading is complete.
    if (!loading) {
      if (!user) {
        // If loading is done and there's no user, redirect to login.
        router.push("/login");
      } else if (!user.enabled) {
        // If the user exists but is not verified, redirect to verify.
        router.push(`/verify?email=${encodeURIComponent(user.email || "")}`);
      }
    }
  }, [user, loading, router]);

  // While the user's status is being determined, show a full-page loader.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is complete and the user is authenticated and enabled,
  // render the protected page content.
  if (user && user.enabled) {
    return <>{children}</>;
  }

  // If the user is not valid for any reason (and a redirect is imminent),
  // continue showing a loader to prevent flashing the login page content.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
