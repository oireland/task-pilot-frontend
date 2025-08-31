"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PlanLimitWarningProps {
  limitType: "daily" | "monthly";
  planRefreshDate: string;
}

export function PlanLimitWarning({
  limitType,
  planRefreshDate,
}: PlanLimitWarningProps) {
  const refreshDate = new Date(planRefreshDate).toDateString();

  return (
    <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            You've reached your {limitType} plan limit.
          </CardTitle>
          <CardDescription>
            Your {limitType} request limit will reset on {refreshDate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please upgrade your plan or wait until your limit resets to continue
            using the service.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/app/settings">Manage Your Plan</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
