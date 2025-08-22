"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { useUser } from "@/hooks/use-user";
import { FileUploader } from "@/components/file-uploader";
import { TaskList } from "@/components/task-list";
import { AlertTriangle, Clipboard, Loader2, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type Step = {
  key: string;
  label: string;
  status: "idle" | "running" | "done" | "error";
};

// Using 'items' to match our updated type definitions
type ExtractedDocDataDTO = {
  title: string;
  status: string;
  description: string;
  items: string[];
};

export function AppPageClient() {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  const isNotionConnected = !!user?.notionWorkspaceName;

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { key: "parse", label: "Parsing document", status: "idle" },
    { key: "extract", label: "Extracting items with AI", status: "idle" },
  ]);
  const [docData, setDocData] = useState<ExtractedDocDataDTO | null>(null);
  const [mathMode, setMathMode] = useState(false);
  const [showSchemaErrorModal, setShowSchemaErrorModal] = useState(false);

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
    setSteps([
      { key: "process", label: "Processing document", status: "running" },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("equations", String(mathMode));

      const responseData: any = await api.postForm(
        "/api/v1/tasks/process",
        formData
      );

      // Standardize on 'items' internally
      const extractedData: ExtractedDocDataDTO = {
        ...responseData,
        items: responseData.tasks || [],
      };

      if (!extractedData.items || extractedData.items.length === 0) {
        toast({
          title: "No items found",
          description:
            "The AI could not identify any actionable items in the document.",
        });
      } else {
        toast({
          title: "Document extracted",
          description: `Found and saved ${extractedData.items.length} items.`,
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
      // Map 'items' back to 'tasks' for the API request
      const payload = {
        ...docData,
        tasks: docData.items,
      };
      await api.post("/api/v1/notion/pages", payload);
      toast({
        title: "Notion page created!",
        description: `Created a checklist for “${docData.title}”.`,
      });
      resetState();
      setFile(null);
    } catch (e: any) {
      if (e.message.includes("invalid schema")) {
        setShowSchemaErrorModal(true);
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
    if (!docData?.items || docData.items.length === 0) return;
    setIsCopying(true);
    try {
      const formattedItems = docData.items
        .map((item) => `• ${item}`)
        .join("\n");
      await navigator.clipboard.writeText(formattedItems);
      toast({
        title: "Items copied to clipboard!",
      });
    } catch (err: any) {
      toast({
        title: "Failed to copy",
        description: "Could not copy items to clipboard.",
        variant: "destructive",
      });
    } finally {
      // Add a small delay to show the checkmark
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  const hasData = !!docData;
  const hasItems = !!docData && docData.items.length > 0;

  const notionButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCreateNotion}
      disabled={!hasItems || isCreating || !isNotionConnected}
      className="gap-2 bg-transparent"
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Image
          src="/icons/notion-logo.svg"
          alt="Notion Logo"
          width={16}
          height={16}
        />
      )}
      <span>Create in Notion</span>
    </Button>
  );

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6">
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
              accept={[".pdf", ".docx", ".txt", ".md"]}
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
              Extract items
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Extracted document</CardTitle>
                <CardDescription>
                  {hasData
                    ? "Review the title, description, and items"
                    : "No data yet"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={!hasItems || isCopying}
                  className="gap-2 bg-transparent"
                >
                  <Clipboard className="h-4 w-4" />
                  <span>{isCopying ? "Copied!" : "Copy list"}</span>
                </Button>
                {isNotionConnected ? (
                  notionButton
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{notionButton}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Connect to Notion in your settings to export.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
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
                    Items ({docData.items.length})
                  </div>
                  {hasItems ? (
                    <TaskList
                      tasks={docData.items}
                      onChange={(updated) =>
                        setDocData((prev) =>
                          prev ? { ...prev, items: updated } : prev
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      No items were found in this document.
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
