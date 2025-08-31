"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Crown,
  Database,
  ExternalLink,
  HelpCircle,
  Loader2,
  Save,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { ConnectNotion } from "./connect-notion";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { STRIPE_PRO_MONTHLY_LINK, STRIPE_PRO_YEARLY_LINK } from "@/lib/stripe";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type NotionDatabase = {
  id: string;
  name: string;
};

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const plan = user?.plan;
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [showDatabaseHelp, setShowDatabaseHelp] = useState(false);

  const isNotionConnected = useMemo(() => !!user?.notionWorkspaceName, [user]);

  useEffect(() => {
    if (user?.notionTargetDatabaseId) {
      setSelectedId(user.notionTargetDatabaseId);
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isNotionConnected) return;

      setLoadingData(true);
      try {
        // Only fetch databases if Notion is connected
        const dbData = await api.get("/api/v1/notion/databases");

        setDatabases(dbData as NotionDatabase[]);
      } catch (error) {
        toast.error("Error", {
          description: "Could not load your settings data.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user, isNotionConnected]);

  const selectedDb = useMemo(
    () => databases.find((d) => d.id === selectedId),
    [selectedId, databases]
  );

  const handleSave = async () => {
    if (!selectedDb) return;

    const request = api.put("/api/v1/users/me/notion-database", {
      databaseId: selectedDb.id,
      databaseName: selectedDb.name,
    });

    toast.promise(request, {
      loading: "Saving...",
      async success() {
        await refreshUser();

        return "Default database saved";
      },

      error: "Could not save your selected database",
    });
  };

  if (!user) {
    return null; // AuthGuard shows a loader
  }

  const upgradeLink = isYearly
    ? STRIPE_PRO_YEARLY_LINK
    : STRIPE_PRO_MONTHLY_LINK;
  const isFreePlan = plan?.name.toLowerCase() === "free";

  return (
    <div className="mt-2 mb-2 max-w-3xl mx-auto space-y-6">
      {/* Conditionally render the Notion settings or the connect prompt */}
      {isNotionConnected ? (
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
                onClick={() =>
                  router.push(`${process.env.NEXT_PUBLIC_NOTION_AUTH_URL}`)
                }
              >
                <ExternalLink className="h-4 w-4" />
                Reconnect
              </Button>
            </div>
            <Separator />
            {loadingData ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading database options...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="database">Target database</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowDatabaseHelp(true)}
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Database structure help</span>
                  </Button>
                </div>
                <Select
                  value={selectedId}
                  onValueChange={(v) => setSelectedId(v)}
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
              </div>
            )}
            <div className="flex gap-3">
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={!selectedDb}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ConnectNotion />
      )}

      {/* Database Help Dialog */}
      <DatabaseHelpDialog
        open={showDatabaseHelp}
        onOpenChange={setShowDatabaseHelp}
      />

      {/* Plan & Usage Card */}
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
          {plan ? (
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

              {/* --- Upgrade Section for Free Users --- */}
              {isFreePlan && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-md font-semibold">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock higher limits and priority support.
                  </p>
                  <div className="flex justify-center items-center gap-4">
                    <Label htmlFor="billing-cycle">Monthly</Label>
                    <Switch
                      id="billing-cycle"
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                      aria-label="Toggle billing cycle"
                    />
                    <Label htmlFor="billing-cycle">Yearly (Save 17%)</Label>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/pricing"
                      className={buttonVariants({
                        variant: "outline",
                        className: "flex-1",
                      })}
                    >
                      View Pricing
                    </Link>
                    <Link
                      target="_blank"
                      className={buttonVariants({ className: "flex-1" })}
                      href={upgradeLink + "?prefilled_email=" + user.email}
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-600">Could not load plan details.</p>
          )}
        </CardContent>
        {plan && !isFreePlan && (
          <CardFooter>
            <Link
              target="_blank"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
              href={process.env.NEXT_PUBLIC_STRIPE_PORTAL_LINK || ""}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Usage Bar component
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

// Extracted Database Help Dialog component
function DatabaseHelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Required Notion Database Structure</DialogTitle>
          <DialogDescription>
            TaskPilot requires specific columns in your Notion database to work
            correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <h4 className="font-medium text-sm">Required Columns:</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <span className="font-semibold">Title</span> - A title column for
              task list titles
            </li>
            <li>
              <span className="font-semibold">Status</span> - A status column
              for tracking completion
            </li>
            <li>
              <span className="font-semibold">Description</span> - A text column
              for task list details
            </li>
          </ul>

          <Separator />

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">💡 Recommendation</p>
            <p className="text-sm text-muted-foreground">
              We strongly recommend using our template when connecting your
              Notion account for the best experience. The template includes all
              required columns and proper configuration.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            If you select a database with an incompatible structure, TaskPilot
            will notify you when trying to export tasks.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
