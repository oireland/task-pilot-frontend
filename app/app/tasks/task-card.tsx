// app/app/tasks/task-card.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/hooks/use-user"; // 1. Import useUser
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // 2. Import Tooltip components
import { ListTodo, Loader2 } from "lucide-react";
import type { TaskDTO } from "./types";

type Props = {
  taskDoc: TaskDTO;
};

export function TaskCard({ taskDoc }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser(); // 3. Get user
  const [isExporting, setIsExporting] = useState(false);
  const isNotionConnected = !!user?.notionWorkspaceName;

  // ... (handleExportToNotion function remains the same)
  const handleExportToNotion = async () => {
    setIsExporting(true);
    try {
      const payload = {
        ...taskDoc,
        tasks: taskDoc.items,
      };
      await api.post("/api/v1/notion/pages", payload);
      toast({
        title: "Notion page created!",
        description: `Created a checklist for “${taskDoc.title}”.`,
      });
    } catch (e: any) {
      if (e.message.includes("invalid schema")) {
        toast({
          title: "Incorrect Database Structure",
          description:
            "The selected Notion database is missing required columns. Please check your settings.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/app/settings")}
            >
              Go to Settings
            </Button>
          ),
        });
      } else {
        toast({
          title: "Failed to create Notion page",
          description: e.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportButton = (
    <Button
      onClick={handleExportToNotion}
      disabled={isExporting || !isNotionConnected}
    >
      {isExporting ? (
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
      Export to Notion
    </Button>
  );

  return (
    <AccordionItem
      value={taskDoc.id}
      className="border rounded-lg px-4 bg-card"
    >
      {/* ... (AccordionTrigger and item list) */}
      <AccordionTrigger className="hover:no-underline">
        <div className="text-left">
          <CardTitle>{taskDoc.title}</CardTitle>
          <CardDescription className="mt-1">
            Created{" "}
            {formatDistanceToNow(new Date(taskDoc.createdAt), {
              addSuffix: true,
            })}
          </CardDescription>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
          {taskDoc.description}
        </p>
        <ul className="space-y-2">
          {taskDoc.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <ListTodo className="h-4 w-4 mt-1 text-muted-foreground" />
              <span className="flex-1 text-sm">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t">
          {/* 4. Wrap the button with Tooltip logic */}
          {isNotionConnected ? (
            exportButton
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{exportButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Connect to Notion in your settings to export.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
