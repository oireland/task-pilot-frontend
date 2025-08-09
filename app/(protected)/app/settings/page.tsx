import { Navbar } from "@/components/navbar";
import { SettingsPageClient } from "./settings-page";
import { cookies } from "next/headers"; // Import cookies from next/headers
import { getNotionConnectionStatus } from "@/lib/notion";

type NotionDatabase = {
  id: string;
  name: string;
};

// Pass the cookie to the function
async function getNotionDatabases(cookie: string | undefined) {
  // If there's no cookie, don't even try to fetch
  if (!cookie) return [];

  const response = await fetch(
    "http://localhost:8080/api/v1/notion/databases",
    {
      headers: {
        // Forward the cookie to the backend API
        Cookie: cookie,
      },
    }
  );
  if (!response.ok) {
    // It will fail if the cookie is invalid or expired, so we return an empty array
    console.error("Failed to fetch Notion databases:", response.status);
    return [];
  }
  return response.json();
}

export default async function SettingsPage() {
  // 1. Get the cookies from the incoming request
  const cookieStore = await cookies();
  const authTokenCookie = cookieStore.get("task_pilot_auth_token");
  const cookie = authTokenCookie
    ? `task_pilot_auth_token=${authTokenCookie.value}`
    : undefined;

  const isNotionConnected = await getNotionConnectionStatus(cookie);

  // 2. Pass the cookie value to the data fetching function
  const databases: NotionDatabase[] = isNotionConnected
    ? await getNotionDatabases(cookie)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <SettingsPageClient databases={databases} />
        </div>
      </main>
    </div>
  );
}
