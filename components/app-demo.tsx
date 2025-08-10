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
import { TaskList } from "@/components/task-list";
import { Loader2, Notebook, Sparkles, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SampleFileSelector } from "./sample-file-selector";

// --- Mock Data and Types ---

type Step = {
  key: string;
  label: string;
  status: "idle" | "running" | "done" | "error";
};

type ExtractedDocDataDTO = {
  title: string;
  status: string;
  description: string;
  tasks: string[];
};

const sampleDocs: Record<string, ExtractedDocDataDTO> = {
  "Project_Phoenix_Kickoff.txt": {
    title: "Project Phoenix Kickoff",
    status: "Not Started",
    description:
      "A project to revamp the customer onboarding experience, to be completed by Q4.",
    tasks: [
      "Update Figma mockups with new branding colors",
      "Schedule follow-up meeting with marketing",
      "Investigate third-party analytics tools",
      "Review the project proposal document",
    ],
  },
  "Calculus_Workshop_Exercises.txt": {
    title: "Calculus Workshop Exercises",
    status: "Not Started",
    description:
      "A collection of exercises covering derivatives and integrals from the Calculus I workshop.",
    tasks: [
      "Find the derivative of f(x) = 3x^4 - 5x^2 + 2",
      "Calculate the derivative of g(x) = x^2 * sin(x)",
      "Evaluate the definite integral of (/ g(x) = e^x /) from 0 to 1",
      "Submit completed exercises by 5 PM on Friday",
    ],
  },
  "Onboarding_Checklist.docx": {
    title: "Onboarding Checklist",
    status: "Not Started",
    description:
      "A checklist for onboarding a new software engineer to the team.",
    tasks: [
      "Set up developer environment (IDE, Git, Docker)",
      "Grant access to GitHub repositories and Jira board",
      "Schedule introductory meetings with team leads",
      "Complete HR and compliance training modules",
      "Review the team's coding standards and documentation",
    ],
  },
};

// --- Demo Component ---

export function AppDemo() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { key: "process", label: "Processing document", status: "idle" },
  ]);
  const [docData, setDocData] = useState<ExtractedDocDataDTO | null>(null);

  const resetState = () => {
    setDocData(null);
    setSteps((s) => s.map((st) => ({ ...st, status: "idle" })));
  };

  // Helper function to simulate network delay
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please choose a sample document to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    resetState();
    setSteps([
      { key: "process", label: "Processing document", status: "running" },
    ]);

    try {
      // Simulate API call delay
      await wait(1500);

      const extractedData = sampleDocs[selectedFile];
      setDocData(extractedData);

      toast({
        title: "Document extracted!",
        description: `Found ${extractedData.tasks.length} tasks in "${selectedFile}".`,
      });
      setSteps([
        { key: "process", label: "Processing document", status: "done" },
      ]);
    } catch (e: any) {
      setSteps([
        { key: "process", label: "Processing document", status: "error" },
      ]);
      toast({
        title: "Something went wrong",
        description: "This is a demo, but something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNotion = () => {
    toast({
      title: "This is a demo!",
      description: "Sign up for a free account to create tasks in Notion.",
    });
  };

  const hasData = !!docData;
  const hasTasks = !!docData && docData.tasks.length > 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* --- Upload Card --- */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Try the Demo</CardTitle>
          <CardDescription>
            Select a sample document to see Task Pilot in action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Select to look like FileUploader */}
          <SampleFileSelector
            value={selectedFile}
            onValueChange={(value) => {
              setSelectedFile(value);
              resetState();
            }}
            options={Object.keys(sampleDocs).map((k) => ({
              value: k,
              label: k,
            }))}
          />

          <Button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Extract tasks
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
                    {step.status}
                  </Badge>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* --- Results Card --- */}
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
                <div className="text-base font-medium">{docData.title}</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm text-gray-500">Description</div>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {docData.description}
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Tasks ({docData.tasks.length})
                </div>
                <TaskList
                  tasks={docData.tasks}
                  // In the demo, we don't need to handle task changes
                  onChange={() => {}}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center py-10">
              Select a sample document and click "Extract tasks" to see the
              results.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Components ---
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
