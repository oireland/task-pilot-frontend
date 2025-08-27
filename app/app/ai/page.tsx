"use client";

import { useUser } from "@/hooks/use-user";
import { AppPageClient } from "./app-page";
import { Loader2 } from "lucide-react";

export default function AppPage() {
  const { loading } = useUser();

  // While the initial user check is running, show a spinner.
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10">
        <AppPageClient />
      </main>
    </div>
  );
}
