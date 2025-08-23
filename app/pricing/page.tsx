import { PricingClient } from "./pricing-client";

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
        <PricingClient />
      </main>
    </div>
  );
}
