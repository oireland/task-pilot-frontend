"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, Sparkles, Clipboard, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { SampleFileSelector } from "@/components/sample-file-selector";

const sampleDocs: Record<
  string,
  { title: string; description: string; tasks: string[] }
> = {
  "Project_Phoenix_Kickoff.txt": {
    title: "Project Phoenix Kickoff",
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

export default function AppDemo() {
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined
  );
  const [file, setFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<string[] | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [mathMode, setMathMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    setIsProcessing(true);
    setTasks(null);
    setCopied(false);

    await new Promise((r) => setTimeout(r, 900));

    if (inputMode === "paste" && inputText.trim()) {
      setTitle("Untitled Document");
      setDescription("Pasted text");
      setTasks([
        "This is the first task",
        "This is the second task",
        "This is the third task",
      ]);
    } else if (inputMode === "upload" && selectedFile) {
      const doc = sampleDocs[selectedFile];
      setTitle(doc.title);
      setDescription(doc.description);
      setTasks(doc.tasks);
    } else {
      setTitle("");
      setDescription("");
      setTasks([]);
    }
    setIsProcessing(false);
  };

  const handleCopy = async () => {
    if (!tasks) return;
    await navigator.clipboard.writeText(tasks.map((t) => `• ${t}`).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Try extracting tasks</CardTitle>
          <CardDescription>
            Select a file or paste some text to see how it works.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={inputMode}
            onValueChange={(value) => {
              setInputMode(value as "upload" | "paste");
              setTasks(null);
              setTitle("");
              setDescription("");
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Sample File</TabsTrigger>
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
              <SampleFileSelector
                value={selectedFile}
                onValueChange={(value) => {
                  setSelectedFile(value);
                  setFile(null);
                  setInputText("");
                  setTasks(null);
                  setTitle("");
                  setDescription("");
                }}
                options={Object.keys(sampleDocs).map((k) => ({
                  value: k,
                  label: k,
                }))}
              />
              {selectedFile && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {selectedFile}
                </div>
              )}
            </TabsContent>
            <TabsContent value="paste" className="pt-4">
              <Textarea
                placeholder="Paste your content here..."
                className="h-28"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setFile(null);
                  setSelectedFile(undefined);
                  setTasks(null);
                  setTitle("");
                  setDescription("");
                }}
              />
            </TabsContent>
          </Tabs>
          <div className="flex items-center gap-2">
            <Checkbox
              id="math-mode-demo"
              checked={mathMode}
              onCheckedChange={(v) => setMathMode(v === true)}
            />
            <Label htmlFor="math-mode-demo" className="text-sm">
              Contains complex math equations
            </Label>
          </div>
          <Button
            onClick={handleExtract}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={
              isProcessing ||
              (inputMode === "upload" && !selectedFile) ||
              (inputMode === "paste" && !inputText.trim())
            }
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Extract tasks
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Extracted document</CardTitle>
          <CardDescription>
            Copy your checklist or export to Notion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks ? (
            tasks.length > 0 ? (
              <div>
                <div className="space-y-1.5 mb-4">
                  <div className="text-sm text-gray-500">Title</div>
                  <div className="text-base font-medium">{title}</div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="text-sm text-gray-500">Description</div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {description}
                  </p>
                </div>
                <ul className="mb-4 space-y-2">
                  {tasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      {task}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy list"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled
                  >
                    <Image
                      src="/icons/notion-logo.svg"
                      alt="Notion Logo"
                      width={16}
                      height={16}
                    />
                    Export to Notion
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Notion export available after signup.
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No tasks found in your document.
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500 text-center py-10">
              Extracted tasks will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
