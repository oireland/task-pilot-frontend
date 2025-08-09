import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, FileText, ListTodo, Sparkles, Upload } from 'lucide-react'
import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 via-white to-white pointer-events-none" />
          <div className="container mx-auto px-4 py-20 md:py-28 relative">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  New • TaskPilot Preview
                </span>
                <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
                  Turn documents into actionable Notion to‑dos
                </h1>
                <p className="mt-5 text-gray-600 text-lg md:text-xl">
                  Upload a syllabus, handbook, or brief. TaskPilot extracts exercises and tasks with AI and drafts a tidy Notion checklist for you.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Link href="/signup">Get started free</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#demo">See a quick demo</Link>
                  </Button>
                </div>
                <div className="mt-6 text-sm text-gray-500">
                  No credit card needed. Mock auth and processing for now.
                </div>
              </div>
              <div className="lg:pl-6">
                <Card className="shadow-lg border-emerald-100" id="demo">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <Upload className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div className="font-medium">Upload document</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <Sparkles className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div className="font-medium">AI extracts tasks</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <ListTodo className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div className="font-medium">Create Notion to‑do list</div>
                    </div>
                    <div className="mt-6 grid sm:grid-cols-2 gap-3">
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          tasks-syllabus.pdf
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600" />
                            Week 1: Read chapters 1–2
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600" />
                            Submit intro assignment
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600" />
                            Set up project workspace
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Notion Checklist</div>
                        <div className="mt-3 text-sm text-gray-600">
                          • Read chapters 1–2
                          <br />
                          • Submit intro assignment
                          <br />
                          • Set up project workspace
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-4 text-xs text-gray-500">
                  When you’re ready to hook up real AI, you can plug in the AI SDK’s generateText/streamText with your preferred model provider. [^2]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              title="Upload any doc"
              description="PDF, DOCX, Markdown, or plain text—TaskPilot handles the formats you use most."
              icon={<Upload className="h-5 w-5 text-emerald-700" />}
            />
            <Feature
              title="AI task extraction"
              description="We detect assignments, exercises, and action items and normalize them into a clean list."
              icon={<Sparkles className="h-5 w-5 text-emerald-700" />}
            />
            <Feature
              title="Notion ready"
              description="Send tasks to a new Notion to‑do list in one click—titles, notes, and due dates included."
              icon={<ListTodo className="h-5 w-5 text-emerald-700" />}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-white p-8 md:p-12">
            <div className="grid md:grid-cols-2 items-center gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  Start turning documents into progress
                </h2>
                <p className="mt-2 text-gray-600">
                  Sign up and try the mocked flow—no setup required. You can wire your AI and Notion later.
                </p>
              </div>
              <div className="flex gap-3 md:justify-end">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Link href="/signup">Create account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Prefer a structured task UI? Consider a Task component to show workflow progress with collapsible details. [^1]
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} TaskPilot. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function Feature({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-2">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
    </div>
  )
}
