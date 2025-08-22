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
import {
  AlertTriangle,
  Clipboard,
  Loader2,
  Notebook,
  Sparkles,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api as realApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

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

// --- Mock API for development ---
const mockApi = {
  postForm: async (
    _url: string,
    formData: FormData
  ): Promise<ExtractedDocDataDTO> => {
    console.log(
      " MOCK API: Processing file:",
      (formData.get("file") as File)?.name
    );
    await new Promise((res) => setTimeout(res, 1000));
    return {
      title: "Mocked Document: The Art of Mocks",
      status: "done",
      description:
        "This is a mocked document description.\nIt even supports multiple lines.",
      tasks: [
        "Understand the user's request for mocking.",
        "Implement a mock API for development.",
        "Use environment variables to toggle the mock.",
        "Ensure mock is not included in production builds.",
      ],
    };
  },
  post: async (url: string, data: any) => {
    console.log(" MOCK API: Creating Notion page", { url, data });
    await new Promise((res) => setTimeout(res, 1000));
    // Simulate schema error for Notion creation for demonstration
    if (url.includes("notion") && data.title.toLowerCase().includes("fail")) {
      throw new Error("invalid schema");
    }
    return { success: true };
  },
};

const useMock =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_MOCK_API === "true";

if (useMock) {
  console.log(
    "Using Mock API. To disable, remove NEXT_PUBLIC_MOCK_API from .env.local"
  );
}

const api = useMock ? (mockApi as typeof realApi) : realApi;
// --- End Mock API ---

export function AppPageClient() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { key: "parse", label: "Parsing document", status: "idle" },
    { key: "extract", label: "Extracting tasks with AI", status: "idle" },
  ]);
  const [docData, setDocData] = useState<ExtractedDocDataDTO | null>(null);
  const [mathMode, setMathMode] = useState(false);
  const [showSchemaErrorModal, setShowSchemaErrorModal] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const router = useRouter();

  const resetState = () => {
    setDocData(null);
    setSteps((s) => s.map((st) => ({ ...st, status: "idle" })));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a document to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    resetState();
    // Use a single "Processing" step for a simpler UI
    setSteps([
      { key: "process", label: "Processing document", status: "running" },
    ]);

    try {
      // Create a single FormData object for the combined request
      const formData = new FormData();
      formData.append("file", file);
      formData.append("equations", String(mathMode));

      const extractedData: ExtractedDocDataDTO = await api.postForm(
        "/api/v1/tasks/process",
        formData
      );

      if (!extractedData.tasks || extractedData.tasks.length === 0) {
        toast({
          title: "No tasks found",
          description:
            "The AI could not identify any actionable tasks in the document.",
        });
      } else {
        toast({
          title: "Document extracted",
          description: `Found ${extractedData.tasks.length} tasks.`,
        });
      }

      setDocData(extractedData);
      setSteps([
        { key: "process", label: "Processing document", status: "done" },
      ]);
    } catch (e: any) {
      setSteps([
        { key: "process", label: "Processing document", status: "error" },
      ]);
      toast({
        title: "Processing failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNotion = async () => {
    if (!docData) return;
    setIsCreating(true);
    try {
      await api.post("/api/v1/notion/pages", docData);
      toast({
        title: "Notion page created!",
        description: `Created a checklist for “${docData.title}”.`,
      });
      resetState();
      setFile(null);
    } catch (e: any) {
      console.log(e.message);

      // Check for the specific error from the backend
      if (e.message.includes("invalid schema")) {
        setShowSchemaErrorModal(true); // Show the modal instead of a toast
      } else {
        toast({
          title: "Failed to create Notion page",
          description: e.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!docData?.tasks || docData.tasks.length === 0) {
      toast({
        title: "No tasks to copy",
        description: "There are no tasks available to copy to the clipboard.",
      });
      return;
    }
    setIsCopying(true);
    try {
      // Format the tasks as a bulleted list
      const formattedTasks = docData.tasks
        .map((task) => `• ${task}`)
        .join("\n");
      await navigator.clipboard.writeText(formattedTasks);
      toast({
        title: "Tasks copied to clipboard!",
        description: "The list of tasks has been copied.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to copy",
        description: "Could not copy tasks to clipboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const hasData = !!docData;
  const hasTasks = !!docData && docData.tasks.length > 0;

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* --- Upload Card --- */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload document</CardTitle>
            <CardDescription>PDF, DOCX, MD, or TXT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploader
              value={file}
              onChange={(f) => {
                setFile(f);
                resetState();
              }}
              accept={[".pdf", ".docx", ".txt"]}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="math-mode"
                checked={mathMode}
                onCheckedChange={(v) => setMathMode(v === true)}
              />
              <Label htmlFor="math-mode" className="text-sm">
                Contains math equations (slower)
              </Label>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!file || isProcessing}
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  disabled={!hasTasks || isCopying}
                  className="gap-2"
                >
                  {isCopying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  Copy tasks
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCreateNotion}
                  disabled={!hasTasks || isCreating}
                  className="gap-2 bg-transparent"
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Image
                      src="/icons/notion-logo.svg"
                      alt="Notion Logo"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                  )}
                  Create in Notion
                </Button>
              </div>
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
                  {hasTasks ? (
                    <TaskList
                      tasks={docData.tasks}
                      onChange={(updated) =>
                        setDocData((prev) =>
                          prev ? { ...prev, tasks: updated } : prev
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      No tasks were found in this document.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center py-10">
                Extract a document to see its details here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* --- Error Modal --- */}
      <AlertDialog
        open={showSchemaErrorModal}
        onOpenChange={setShowSchemaErrorModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Incorrect Database Structure
            </AlertDialogTitle>
            <AlertDialogDescription>
              The Notion database you've selected is missing the required
              columns ('Title', 'Status', 'Description'). Please choose a
              different database or use our template to create a compatible one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/app/settings")}>
              Go to Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- Helper Components & Functions ---

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
