// components/navbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "../hooks/use-user";
import { BookCheck, Grip, Loader2, SparkleIcon } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, loading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  const getInitials = (email?: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold text-lg md:text-2xl tracking-tight"
        >
          <span className="text-primary">Task</span>Pilot
        </Link>

        {loading ? (
          <div />
        ) : !user ? (
          // --- UPDATED LOGGED OUT STATE ---
          <>
            <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
              <Link
                href="/#demo"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                Demo
              </Link>
              <Link
                href="/pricing"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({
                    variant: "default",
                    className:
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  })
                )}
              >
                Sign up
              </Link>
              <ModeToggle />
            </div>
          </>
        ) : (
          // --- LOGGED IN STATE ---
          <div className="flex items-center gap-4">
            <ModeToggle />

            {/* User Menu */}
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

            {/* App Launcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0"
                  aria-label="App launcher"
                >
                  <Grip className="h-5 md:h-7 w-5 md:w-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background w-48 mt-1.5"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/app/tasks")}
                >
                  <BookCheck className="text-primary h-4 w-4" />
                  <span>Tasks</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/app/ai")}
                >
                  <SparkleIcon className="text-primary h-4 w-4" />
                  <span>AI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
