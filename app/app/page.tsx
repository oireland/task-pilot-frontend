"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/file-uploader";
import { TaskList } from "@/components/task-list";
import { Navbar } from "@/components/navbar";
import { Loader2, Notebook, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Step = {
  key: string;
  label: string;
  status: "idle" | "running" | "done" | "error";
};

type ExtractedDocDataDTO = {
  Title: string;
  Status: string; // always "Not Started" (hidden in UI)
  Description: string;
  Tasks: string[];
};

export default function AppPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { key: "upload", label: "Upload received", status: "idle" },
    { key: "analyze", label: "Analyzing with AI", status: "idle" },
    { key: "extract", label: "Extracting tasks", status: "idle" },
  ]);
  const [docData, setDocData] = useState<ExtractedDocDataDTO | null>(null);
  const [mathMode, setMathMode] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a document to process.",
      });
      return;
    }

    setIsProcessing(true);
    setSteps((s) =>
      s.map((st) => ({
        ...st,
        status: st.key === "upload" ? "running" : "idle",
      }))
    );

    try {
      await wait(600);
      setSteps((s) =>
        s.map((st) =>
          st.key === "upload"
            ? { ...st, status: "done" }
            : st.key === "analyze"
            ? { ...st, status: "running" }
            : st
        )
      );
      await wait(900);
      setSteps((s) =>
        s.map((st) =>
          st.key === "analyze"
            ? { ...st, status: "done" }
            : st.key === "extract"
            ? { ...st, status: "running" }
            : st
        )
      );

      const data = await mockExtract(file, mathMode);

      await wait(700);
      setSteps((s) =>
        s.map((st) => (st.key === "extract" ? { ...st, status: "done" } : st))
      );
      setDocData(data);
      toast({
        title: "Document extracted",
        description: `Found ${data.Tasks.length} tasks.`,
      });
    } catch (e: any) {
      setSteps((s) =>
        s.map((st) =>
          st.status === "running" ? { ...st, status: "error" } : st
        )
      );
      toast({
        title: "Processing failed",
        description: e?.message ?? "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNotion = async () => {
    if (!docData) return;
    await wait(600);
    toast({
      title: "Notion list created",
      description: `Created a Notion checklist for “${docData.Title}” with ${docData.Tasks.length} tasks (mock).`,
    });
  };

  const hasData = !!docData;
  const hasTasks = !!docData && docData.Tasks.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upload document</CardTitle>
              <CardDescription>PDF, DOCX, MD, or TXT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                value={file}
                onChange={setFile}
                accept={[".pdf", ".docx", ".md", ".txt"]}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="math-mode"
                  checked={mathMode}
                  onCheckedChange={(v) => setMathMode(v === true)}
                />
                <Label htmlFor="math-mode" className="text-sm">
                  Contains math equations (format with LaTeX)
                </Label>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!file || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract tasks
                  </>
                )}
              </Button>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Pipeline</h4>
                <ol className="space-y-2">
                  {steps.map((step) => (
                    <li
                      key={step.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <StepDot status={step.status} />
                        <span>{step.label}</span>
                      </div>
                      <Badge
                        variant={
                          step.status === "done"
                            ? "secondary"
                            : step.status === "error"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {step.status === "idle" && "idle"}
                        {step.status === "running" && "running"}
                        {step.status === "done" && "done"}
                        {step.status === "error" && "error"}
                      </Badge>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Extracted document</CardTitle>
                  <CardDescription>
                    {hasData
                      ? "Review the title, description, and tasks"
                      : "No data yet"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCreateNotion}
                  disabled={!hasTasks}
                  className="gap-2 bg-transparent"
                >
                  <Notebook className="h-4 w-4" />
                  Create in Notion
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {hasData ? (
                <>
                  <div className="space-y-1.5">
                    <div className="text-sm text-gray-500">Title</div>
                    <div className="text-base font-medium">
                      {docData!.Title}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm text-gray-500">Description</div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {docData!.Description}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Tasks</div>
                    <TaskList
                      tasks={docData!.Tasks}
                      onChange={(updated) =>
                        setDocData((prev) =>
                          prev ? { ...prev, Tasks: updated } : prev
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  Extract a document to see its details here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StepDot({ status }: { status: Step["status"] }) {
  const color =
    status === "done"
      ? "bg-emerald-600"
      : status === "error"
      ? "bg-red-600"
      : status === "running"
      ? "bg-amber-500"
      : "bg-gray-300";
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
      aria-hidden="true"
    />
  );
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function mockExtract(
  file: File,
  mathMode: boolean
): Promise<ExtractedDocDataDTO> {
  // Simulate network/processing delay
  await wait(500);
  const filename = file?.name || "document.txt";
  const title = toTitleCase(
    filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim() || "Untitled Document"
  );
  const description = mathMode
    ? "This document appears to include mathematical expressions. Tasks are prepared with LaTeX-friendly formatting for equations and symbols."
    : `This document appears to contain action items and exercises related to “${title}”. Below is a concise list of tasks detected from headings and imperative sentences.`;

  const tasks = mathMode ? createMathTasks(title) : createMockTasks(title);

  return {
    Title: title,
    Status: "Not Started",
    Description: description,
    Tasks: tasks,
  };
}

function toTitleCase(s: string) {
  return s.replace(
    /\w\S*/g,
    (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase()
  );
}

function createMockTasks(seed: string): string[] {
  const base = seed || "document";
  return [
    `Read the introduction of ${base}`,
    `Highlight key definitions in ${base}`,
    `Summarize the main objectives from ${base}`,
    `Draft a checklist of deliverables mentioned in ${base}`,
    `Plan next steps and tentative deadlines for ${base}`,
  ];
}

function createMathTasks(topic: string): string[] {
  return [
    "List all variables and symbols (e.g., \\\\alpha, \\\\beta, \\\\gamma, \\\\theta).",
    "Rewrite the core formulas in LaTeX, for example: E = mc^2 as \\$\\$ E = mc^{2} \\$\\$.",
    "Differentiate a sample polynomial: \\$\\$ \\\\frac{d}{dx} x^{3} = 3x^{2} \\$\\$.",
    "Evaluate a basic integral: \\$\\$ \\\\int_{0}^{1} x^{2}\\\\,dx = \\\\frac{1}{3} \\$\\$.",
    "Typeset a matrix example: \\$\\$ \\\\begin{bmatrix} 1 & 2 \\\\\\\\ 3 & 4 \\\\end{bmatrix} \\$\\$.",
  ].map((t) => `${t} (from ${topic})`);
}
