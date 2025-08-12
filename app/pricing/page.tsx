import Link from "next/link";
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Choose the plan that's right for you
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
            Start for free and scale up as you need. TaskPilot is designed to
            grow with your productivity needs.
          </p>
        </section>

        {/* Pricing Cards Section */}
        <section className="container mx-auto px-4 pb-20">
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
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>
                      <span className="font-semibold">30</span> requests per
                      month
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>
                      <span className="font-semibold">5</span> requests per day
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>AI-powered task extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>Notion integration</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-emerald-500 ring-2 ring-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-emerald-600" />
                  Pro
                </CardTitle>
                <CardDescription>
                  For power users and professionals who need more from
                  TaskPilot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">Coming Soon!</div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>
                      <span className="font-semibold">1,000</span> requests per
                      month
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>
                      <span className="font-semibold">50</span> requests per day
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>All features from Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
