import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, FileText, ListTodo, Sparkles, Upload } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AppDemo } from "@/components/app-demo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Light gradient overlay; dark gets a subtle tinted overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-900/10 dark:via-transparent dark:to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 py-20 md:py-28 relative">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  New • TaskPilot Preview
                </span>
                <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
                  {"Turn documents into actionable Notion to‑dos"}
                </h1>
                <p className="mt-5 text-gray-600 dark:text-gray-300 text-lg md:text-xl">
                  {
                    "Upload a syllabus, handbook, or brief. TaskPilot extracts exercises and tasks with AI and drafts a tidy Notion checklist for you."
                  }
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Link href="/signup">Get started free</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 bg-transparent"
                  >
                    <Link href="#demo">See a quick demo</Link>
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  No credit card needed to get started.
                </div>
              </div>
              <div className="lg:pl-6">
                <Card className="shadow-lg border-emerald-100 dark:border-neutral-800 dark:bg-neutral-900/60">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                        <Upload className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div className="font-medium">Upload document</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                        <Sparkles className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div className="font-medium">AI extracts tasks</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
                        <ListTodo className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div className="font-medium">
                        Create Notion to‑do list
                      </div>
                    </div>
                    <div className="mt-6 grid sm:grid-cols-2 gap-3">
                      <div className="rounded-md border p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          tasks-syllabus.pdf
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            {"Week 1: Read chapters 1–2"}
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            Submit intro assignment
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                            Set up project workspace
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-md border p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="text-sm font-medium">
                          Notion Checklist
                        </div>
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                          {"• Read chapters 1–2"}
                          <br />• Submit intro assignment
                          <br />• Set up project workspace
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              title="Upload any doc"
              description="PDF, DOCX, Markdown, or plain text—TaskPilot handles the formats you use most."
              icon={
                <Upload className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              }
            />
            <Feature
              title="AI task extraction"
              description="We detect assignments, exercises, and action items and normalize them into a clean list."
              icon={
                <Sparkles className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              }
            />
            <Feature
              title="Notion ready"
              description="Send tasks to a new Notion to‑do list in one click—titles, notes, and due dates included."
              icon={
                <ListTodo className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              }
            />
          </div>
        </section>

        {/* --- DEMO SECTION (NEW) --- */}
        <section id="demo" className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">
              See It in Action
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              Select a sample document below to see how Task Pilot extracts
              tasks in just a few seconds. No signup required.
            </p>
          </div>
          <div className="mt-10">
            <AppDemo />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-white dark:from-neutral-900 dark:to-neutral-900 dark:border-neutral-800 p-8 md:p-12">
            <div className="grid md:grid-cols-2 items-center gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  Start turning documents into progress
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {
                    "Sign up and try the mocked flow—no setup required. You can wire your AI and Notion later."
                  }
                </p>
              </div>
              <div className="flex gap-3 md:justify-end">
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Link href="/signup">Create account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 bg-transparent"
                >
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {
                "Prefer a structured task UI? Consider a Task component to show workflow progress with collapsible details."
              }{" "}
              [^1]
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t dark:border-neutral-800">
        <div className="container mx-auto px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} TaskPilot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
