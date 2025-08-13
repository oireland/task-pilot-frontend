import { Navbar } from "@/components/navbar";
import { SettingsPageClient } from "./settings-page";
import { cookies } from "next/headers";
import { getNotionConnectionStatus } from "@/lib/notion";

type NotionDatabase = {
  id: string;
  name: string;
};

async function getNotionDatabases(
  cookie: string | undefined
): Promise<NotionDatabase[]> {
  if (!cookie) return [];

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notion/databases`,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );
  if (!response.ok) {
    console.error("Failed to fetch Notion databases:", response.status);
    return [];
  }
  return response.json();
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const authTokenCookie = cookieStore.get("task_pilot_auth_token");
  const cookie = authTokenCookie
    ? `task_pilot_auth_token=${authTokenCookie.value}`
    : undefined;

  const isNotionConnected = await getNotionConnectionStatus(cookie);

  const databases: NotionDatabase[] = isNotionConnected
    ? await getNotionDatabases(cookie)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <SettingsPageClient databases={databases} />
        </div>
      </main>
    </div>
  );
}
