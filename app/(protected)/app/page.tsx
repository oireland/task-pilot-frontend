import { cookies } from "next/headers";
import { ConnectNotionCTA } from "@/components/connect-notion-cta";
import { Navbar } from "@/components/navbar";
import { AppPageClient } from "./app-page";
import { getNotionConnectionStatus } from "@/lib/notion";

// Function to get the user's Notion connection status from the backend

export default async function AppPage() {
  const cookieStore = await cookies();
  const authTokenCookie = cookieStore.get("task_pilot_auth_token");
  const cookie = authTokenCookie
    ? `task_pilot_auth_token=${authTokenCookie.value}`
    : undefined;

  const isNotionConnected = await getNotionConnectionStatus(cookie);

  return (
    <div className="min-h-screen bg-bg-background">
      <main className="container mx-auto px-4 py-10">
        {isNotionConnected ? <AppPageClient /> : <ConnectNotionCTA />}
      </main>
    </div>
  );
}
