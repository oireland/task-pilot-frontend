"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export function ConnectNotionCTA() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <div className="mb-4 text-2xl font-bold">Connect to Notion</div>
      <p className="mb-6 max-w-sm text-gray-600">
        To use Task Pilot, you need to connect your Notion account. This allows
        us to create and manage tasks in your selected database.
      </p>
      <Button onClick={() => router.push("/app/settings")} className="gap-2">
        <Link className="h-4 w-4" />
        Go to Settings to Connect
      </Button>
    </div>
  );
}
