"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Link } from "lucide-react";

export function ConnectNotion() {
  const router = useRouter();

  const handleConnect = () => {
    // Redirect the user to your backend's Notion connection endpoint
    router.push(`${process.env.NEXT_PUBLIC_NOTION_AUTH_URL}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Notion</CardTitle>
        <CardDescription>
          To get started, you need to connect your Notion account to Task Pilot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Task Pilot needs access to:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>View your workspaces and databases</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Create and update pages in your selected database</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Read content from your documents to create tasks</span>
            </li>
          </ul>
        </div>
        <Button onClick={handleConnect} className="w-full gap-2">
          <Link className="h-4 w-4" />
          Connect Notion
        </Button>
        <p className="text-center text-xs text-gray-500">
          You will be redirected to Notion to authorize the connection.
        </p>
      </CardContent>
    </Card>
  );
}
