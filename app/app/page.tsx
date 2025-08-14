"use client";

import { useUser } from "@/hooks/use-user";
import { ConnectNotionCTA } from "@/components/connect-notion-cta";
import { AppPageClient } from "./app-page";
import { Loader2 } from "lucide-react";

export default function AppPage() {
  const { user, loading } = useUser();

  // While the user object is loading from the initial API call, show a spinner.
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Once loaded, check for the Notion connection and render the appropriate component.
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10">
        {user?.notionWorkspaceName ? <AppPageClient /> : <ConnectNotionCTA />}
      </main>
    </div>
  );
}
