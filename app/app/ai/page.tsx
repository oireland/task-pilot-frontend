"use client";

import { useUser } from "@/hooks/use-user";
import { AppPageClient } from "./app-page";
import { Loader2 } from "lucide-react";
import { PlanLimitWarning } from "./plan-limit-warning";
import { addDays, format } from "date-fns";

export default function AppPage() {
  const { loading, user } = useUser();

  // While the initial user check is running, show a spinner.
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasExceededMonthly =
    user!.requestsInCurrentMonth >= user!.plan.requestsPerMonth;
  const hasExceedDaily =
    user!.requestsInCurrentDay >= user!.plan.requestsPerDay;

  if (hasExceededMonthly) {
    return (
      <PlanLimitWarning
        limitType="monthly"
        planRefreshDate={user!.planRefreshDate}
      />
    );
  }

  if (hasExceedDaily) {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    return (
      <PlanLimitWarning
        limitType="daily"
        planRefreshDate={tomorrow.toDateString()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10">
        <AppPageClient />
      </main>
    </div>
  );
}
