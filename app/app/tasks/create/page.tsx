"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TaskList } from "@/components/task-list";
import { Separator } from "@/components/ui/separator";

// A type for the new task data, omitting fields like id and createdAt
type NewTaskData = {
  title: string;
  description: string;
  items: string[];
};

export default function CreateTaskPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [taskData, setTaskData] = useState<NewTaskData>({
    title: "",
    description: "",
    items: [""], // Start with one empty item
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTitleTouched, setIsTitleTouched] = useState(false); // 1. State to track if the input has been touched

  const titleError = useMemo(() => {
    if (taskData.title.trim().length === 0) {
      return "Title cannot be blank.";
    }
    if (taskData.title.length > 255) {
      return "Title cannot exceed 255 characters.";
    }
    return null;
  }, [taskData.title]);

  const handleCreate = async () => {
    // Mark the field as touched on submit, in case the user clicks the button without touching the field
    setIsTitleTouched(true);

    if (titleError) {
      toast({
        title: "Cannot create task",
        description: titleError,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/api/v1/tasks", {
        title: taskData.title,
        description: taskData.description,
        items: taskData.items.filter((item) => item.trim() !== ""),
      });
      toast({
        title: "Success!",
        description: "Your new task has been created.",
      });
      router.push("/app/tasks");
    } catch (err: any) {
      toast({
        title: "Error creating task",
        description: err.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/app/tasks");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Task</CardTitle>
          <CardDescription>
            Fill in the details for your new task document below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              onBlur={() => setIsTitleTouched(true)} // 2. Set touched to true when the user leaves the field
              placeholder="Enter a title for your document"
              aria-invalid={!!titleError && isTitleTouched}
            />
            {/* 3. Only show the error if the field has been touched */}
            {isTitleTouched && titleError && (
              <p className="text-xs text-red-600">{titleError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              placeholder="Enter a short description"
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>
              Items (
              {taskData.items.filter((item) => item.trim() !== "").length})
            </Label>
            <TaskList
              items={taskData.items}
              onChange={(newItems) =>
                setTaskData({ ...taskData, items: newItems })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSaving || (isTitleTouched && !!titleError)}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
