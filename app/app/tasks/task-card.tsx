"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { useUser } from "@/hooks/use-user";
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
} from "@/components/ui/tooltip";
import { ListTodo, Loader2, Pencil, Trash2 } from "lucide-react";
import type { TaskDTO } from "./types";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  taskDoc: TaskDTO;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onDelete: () => void;
};

export function TaskCard({
  taskDoc,
  isSelected,
  onSelectionChange,
  onDelete,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const isNotionConnected = !!user?.notionWorkspaceName;
  const isDatabaseSelected = !!user?.notionTargetDatabaseId;
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/tasks/${taskDoc.id}`);
      toast({ title: "Task deleted successfully" });
      onDelete();
    } catch (e: any) {
      toast({
        title: "Failed to delete task",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
    <div className="flex items-start gap-4">
      {/* This wrapper ensures the checkbox aligns with the trigger's content */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelectionChange}
        aria-label={`Select task ${taskDoc.title}`}
        className="mt-6"
      />
      <AccordionItem
        value={taskDoc.id}
        className="border rounded-lg bg-card flex-1"
      >
        <AccordionTrigger className="hover:no-underline px-4">
          <div className="text-left">
            <CardTitle>{taskDoc.title}</CardTitle>
            <CardDescription className="mt-1">
              Updated{" "}
              {formatDistanceToNow(new Date(taskDoc.updatedAt), {
                addSuffix: true,
              })}
            </CardDescription>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
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
          <p className="text-sm font-semibold text-muted-foreground mt-4">
            Created: {format(new Date(taskDoc.createdAt), "PP")}
          </p>
          <div className="mt-2 pt-4 border-t flex items-center justify-between">
            {isNotionConnected && isDatabaseSelected ? (
              exportButton
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{exportButton}</span>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/app/tasks/edit/${taskDoc.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
