"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, ExternalLink, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ConnectNotion } from "./connect-notion";

type NotionDatabase = {
  id: string;
  name: string;
};

type SettingsPageClientProps = {
  databases: NotionDatabase[];
};

export function SettingsPageClient({ databases }: SettingsPageClientProps) {
  const { user } = useUser();

  const { toast } = useToast();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    user?.notionTargetDatabaseId
  );

  useEffect(() => {
    if (user?.notionTargetDatabaseId) {
      setSelectedId(user.notionTargetDatabaseId);
    }
  }, [user]);

  const selectedDb = useMemo(
    () => databases.find((d) => d.id === selectedId),
    [selectedId, databases]
  );

  const handleSave = async () => {
    if (!selectedDb) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/notion-database`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            databaseId: selectedDb.id,
            databaseName: selectedDb.name,
          }),
        }
      );

      if (response.ok) {
        console.log(response);

        toast({
          title: "Default database saved",
          description: `New tasks will be created in “${selectedDb.name}”.`,
        });
      } else {
        throw new Error("Failed to save database");
      }
    } catch (error) {
      console.error("Failed to save database", error);
      toast({
        title: "Error",
        description: "Could not save your selected database.",
        variant: "destructive",
      });
    }
  };

  const isNotionConnected = useMemo(() => !!user?.notionWorkspaceName, [user]);

  if (!user) {
    return <div>Loading...</div>; // Or redirect to login
  }

  // If the user is not connected to Notion, show the ConnectNotion component
  if (!isNotionConnected) {
    return <ConnectNotion />;
  }

  // Otherwise, show the settings page
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Notion settings
        </CardTitle>
        <CardDescription>
          Choose the Notion database where TaskPilot will store extracted tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Connection</span>
          <Badge variant="secondary">
            Connected to {user.notionWorkspaceName}
          </Badge>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => router.push("/notion/connect")}
          >
            <ExternalLink className="h-4 w-4" />
            Reconnect
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="database">Target database</Label>
          <Select
            value={selectedId}
            onValueChange={(v) => setSelectedId(v)}
            disabled={!isNotionConnected}
          >
            <SelectTrigger id="database" className="w-full">
              <SelectValue placeholder="Select a Notion database" />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db.id} value={db.id}>
                  {db.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Don&apos;t see your database? Ensure you&apos;ve connected Notion
            and granted access to the workspace.
          </p>
        </div>

        {selectedDb && (
          <div className="rounded-md border bg-gray-50 p-3 text-sm">
            <div className="text-gray-600">
              Selected: <span className="font-medium">{selectedDb.name}</span>
            </div>
            <div className="text-gray-500">Database ID: {selectedDb.id}</div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleSave}
            disabled={!selectedDb}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSelectedId(user?.notionTargetDatabaseId)}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
