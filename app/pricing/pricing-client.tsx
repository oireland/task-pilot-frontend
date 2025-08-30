"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user"; // 1. Import useUser
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Crown, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PricingClient() {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useUser(); // 2. Get the user state

  const proPlanHref = isYearly
    ? "/signup?plan=pro&interval=yearly"
    : "/signup?plan=pro&interval=monthly";

  return (
    <section className="container mx-auto px-4 pb-20">
      {/* --- Hide toggle for logged-in users to simplify the view --- */}

      <div className="flex justify-center items-center gap-4 mb-10">
        <Label htmlFor="billing-cycle">Monthly</Label>
        <Switch
          id="billing-cycle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          aria-label="Toggle billing cycle"
        />
        <Label htmlFor="billing-cycle">Yearly (Save 17%)</Label>
      </div>

      <div className="grid max-w-4xl mx-auto gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Free
            </CardTitle>
            <CardDescription>
              Perfect for light, personal use to get a feel for TaskPilot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              £0
              <span className="text-lg font-normal text-muted-foreground">
                /month
              </span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>
                  <span className="font-semibold">15</span> requests per month
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>
                  <span className="font-semibold">3</span> requests per day
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>AI-powered task extraction</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Notion integration</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* 3. Show different button based on user state */}
            {user ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/app/settings">Manage Plan in Settings</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary ring-2 ring-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Pro
            </CardTitle>
            <CardDescription>
              For power users and professionals who need more from TaskPilot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              {isYearly ? "£99.00" : "£9.99"}
              <span className="text-lg font-normal text-muted-foreground">
                {isYearly ? "/year" : "/month"}
              </span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>
                  <span className="font-semibold">100</span> requests per month
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>
                  <span className="font-semibold">15</span> requests per day
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>All features from Free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {/* 4. Show different button based on user state */}
            {user ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/app/settings">Manage Plan in Settings</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href={proPlanHref}>Subscribe to Pro</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
