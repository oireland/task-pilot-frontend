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
import {
  AlertTriangle,
  Clipboard,
  Loader2,
  Save,
  Sparkles,
  X,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TaskDTO = {
  id: number;
  title: string;
  description: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
};

export function AppPageClient() {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  const isNotionConnected = !!user?.notionWorkspaceName;
  const isDatabaseSelected = !!user?.notionTargetDatabaseId;

  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [docData, setDocData] = useState<TaskDTO | null>(null);
  const [mathMode, setMathMode] = useState(false);
  const [showSchemaErrorModal, setShowSchemaErrorModal] = useState(false);

  const resetState = () => {
    setDocData(null);
  };

  const handleClear = () => {
    resetState();
    setFile(null);
    setInputText("");
  };

  const handleSubmit = async () => {
    let fileToProcess = file;

    // If in paste mode, create a file from the text input
    if (inputMode === "paste") {
      if (!inputText.trim()) {
        toast({
          title: "No text provided",
          description: "Please paste some text to process.",
          variant: "destructive",
        });
        return;
      }
      fileToProcess = new File([inputText], "pasted-text.txt", {
        type: "text/plain",
      });
    }

    if (!fileToProcess) {
      toast({
        title: "No input provided",
        description: "Please upload a file or paste text to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    resetState();

    try {
      const formData = new FormData();
      formData.append("file", fileToProcess);
      formData.append("equations", String(mathMode));

      const responseData: any = await api.postForm(
        "/api/v1/tasks/process",
        formData
      );

      // Standardize on 'items' internally
      const extractedData: TaskDTO = {
        ...responseData,
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
    } catch (e: any) {
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
      handleClear();
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

  const handleUpdate = async () => {
    if (!docData?.id) return;

    setIsUpdating(true);
    try {
      await api.put(`/api/v1/tasks/${docData.id}`, {
        title: docData.title,
        description: docData.description,
        items: docData.items,
      });
      toast({
        title: "Success!",
        description: "Your changes have been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Error saving changes",
        description: err.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasData = !!docData;
  const hasItems = !!docData && docData.items.length > 0;
  const canSubmit =
    (inputMode === "upload" && !!file) ||
    (inputMode === "paste" && !!inputText.trim());

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
      <div className="space-y-1 mb-3">
        <h1 className="text-2xl font-bold tracking-tight">TaskPilot AI</h1>
        <p className="text-muted-foreground">
          Extract actionable todos from documents or text.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Provide Content</CardTitle>
            <CardDescription>
              Upload a file or paste text directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={inputMode}
              onValueChange={(value) =>
                setInputMode(value as "upload" | "paste")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-4">
                <FileUploader
                  value={file}
                  onChange={(f) => {
                    setFile(f);
                    setInputText(""); // Clear text input when a file is selected
                    resetState();
                  }}
                  accept={[".pdf", ".docx", ".txt", ".md"]}
                />
              </TabsContent>
              <TabsContent value="paste" className="pt-4">
                <Textarea
                  placeholder="Paste your content here..."
                  className="h-32"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setFile(null); // Clear file input when text is pasted
                    resetState();
                  }}
                />
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-2">
              <Checkbox
                id="math-mode"
                checked={mathMode}
                onCheckedChange={(v) => setMathMode(v === true)}
              />
              <Label htmlFor="math-mode" className="text-sm">
                Contains complex math equations (slower, more accurate)
              </Label>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canSubmit || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Extract items
            </Button>
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
                {/* Update and Copy buttons appear only when data is present */}
                {hasData && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="gap-2 bg-transparent"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{isUpdating ? "Saving..." : "Update"}</span>
                    </Button>

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
                  </>
                )}
                {isNotionConnected && isDatabaseSelected ? (
                  notionButton
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{notionButton}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isNotionConnected
                            ? "Select a target database in your settings to export."
                            : "Connect to Notion in your settings to export."}
                        </p>
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
                  <Label htmlFor="doc-title" className="text-sm text-gray-500">
                    Title
                  </Label>
                  <Input
                    id="doc-title"
                    className="text-base font-medium"
                    value={docData.title}
                    onChange={(e) =>
                      setDocData((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="doc-description"
                    className="text-sm text-gray-500"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="doc-description"
                    className="text-sm text-gray-700 whitespace-pre-line"
                    value={docData.description}
                    onChange={(e) =>
                      setDocData((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Items ({docData.items.length})
                  </div>
                  {hasItems ? (
                    <TaskList
                      items={docData.items}
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
