"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "../hooks/use-user"; // Adjust path if necessary
import { Loader2 } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  // 1. Get user state and loading status from the hook
  const { user, setUser, loading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    // Call your backend logout endpoint
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Clear user state on the client and redirect
    setUser(null);
    router.push("/");
  };

  // Helper to get initials from email
  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-emerald-600">Task</span>Pilot
        </Link>

        {/* 2. Conditionally render navigation based on user state */}
        {loading ? (
          <div /> // Render a placeholder during load to prevent layout shift
        ) : !user ? (
          // --- LOGGED OUT STATE ---
          <>
            {/* Add nav in the centre for demo and pricing page when pricing page is created */}
            {/* <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex"></nav> */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                asChild
              >
                <Link href="/signup">Sign up</Link>
              </Button>
              <ModeToggle />
            </div>
          </>
        ) : (
          // --- LOGGED IN STATE ---
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/app">App</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.notionWorkspaceIcon ?? undefined}
                      alt={user.email}
                    />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.notionWorkspaceName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/app/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
