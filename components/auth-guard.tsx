"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "./user-provider"; // Adjust path to your UserProvider
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the user's status is finished loading.
    if (loading) {
      return;
    }

    // If there is no user or the user's account is not enabled, redirect.
    if (!user) {
      router.push("/login");
    } else if (!user.enabled) {
      router.push(`/verify?email=${user.email}`);
    }
  }, [user, loading, router]);

  // While loading, or if the user is invalid, show a loading screen.
  // This prevents the protected content from flashing on the screen before the redirect.
  if (loading || !user || !user.enabled) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is authenticated and enabled, render the protected content.
  return <>{children}</>;
}
