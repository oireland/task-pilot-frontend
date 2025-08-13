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
import { Crown, Database, ExternalLink, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ConnectNotion } from "./connect-notion";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

type NotionDatabase = {
  id: string;
  name: string;
};

type PlanDTO = {
  name: string;
  requestsPerDay: number;
  requestsPerMonth: number;
};

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [plan, setPlan] = useState<PlanDTO | null>(null);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.notionTargetDatabaseId) {
      setSelectedId(user.notionTargetDatabaseId);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoadingData(true);
      try {
        const [planData, dbData] = await Promise.all([
          api.get("/api/v1/plans/me"),
          user.notionWorkspaceName
            ? api.get("/api/v1/notion/databases")
            : Promise.resolve([]),
        ]);
        setPlan(planData as PlanDTO);
        setDatabases(dbData as NotionDatabase[]);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load your settings data.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const selectedDb = useMemo(
    () => databases.find((d) => d.id === selectedId),
    [selectedId, databases]
  );

  const handleSave = async () => {
    if (!selectedDb) return;
    try {
      await api.put("/api/v1/users/me/notion-database", {
        databaseId: selectedDb.id,
        databaseName: selectedDb.name,
      });
      toast({
        title: "Default database saved",
        description: `New tasks will be created in “${selectedDb.name}”.`,
      });
      await refreshUser();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not save your selected database.",
        variant: "destructive",
      });
    }
  };

  const isNotionConnected = useMemo(() => !!user?.notionWorkspaceName, [user]);

  if (!user) {
    return null; // The AuthGuard is already showing a loader
  }

  if (!isNotionConnected) {
    return <ConnectNotion />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Notion settings
          </CardTitle>
          <CardDescription>
            Choose the Notion database where TaskPilot will store extracted
            tasks.
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
            <Select value={selectedId} onValueChange={(v) => setSelectedId(v)}>
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
          </div>
          <div className="flex gap-3">
            <Button
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleSave}
              disabled={!selectedDb}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plan & Usage
          </CardTitle>
          <CardDescription>
            Details about your current TaskPilot plan and limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingData ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading plan details...
            </div>
          ) : plan ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current plan</span>
                <Badge variant="outline">{plan.name}</Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <UsageBar
                  label="Daily requests"
                  used={user.requestsInCurrentDay}
                  limit={plan.requestsPerDay}
                />
                <UsageBar
                  label="Monthly requests"
                  used={user.requestsInCurrentMonth}
                  limit={plan.requestsPerMonth}
                />
              </div>
              {user.planRefreshDate && (
                <div className="text-xs text-gray-500">
                  Your plan and limits will reset on{" "}
                  {new Date(user.planRefreshDate).toLocaleDateString()}.
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-600">Could not load plan details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used?: number;
  limit?: number;
}) {
  const usedNum = used ?? 0;
  const limitNum = limit ?? 0;
  const percent = limitNum > 0 ? (usedNum / limitNum) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {usedNum} / {limitNum}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
