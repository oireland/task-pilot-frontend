// app/app/tasks/edit/[taskId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { TaskDTO } from "../../types";

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

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const taskId = params.taskId as string;

  const [task, setTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/v1/tasks/${taskId}`);
        setTask(data as TaskDTO);
      } catch (err) {
        setError("Failed to load task. It may have been deleted.");
        toast({
          title: "Error",
          description: "Could not fetch the requested task.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSave = async () => {
    if (!task) return;

    setIsSaving(true);
    try {
      await api.put(`/api/v1/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        items: task.items,
      });
      toast({
        title: "Success!",
        description: "Your changes have been saved.",
      });
      router.push("/app/tasks");
    } catch (err: any) {
      toast({
        title: "Error saving changes",
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-xl font-semibold text-destructive">{error}</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/app/tasks")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
          <CardDescription>
            Modify the details of your task document below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              placeholder="Enter a title for your document"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              placeholder="Enter a short description"
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>Items ({task.items.length})</Label>
            <TaskList
              tasks={task.items}
              onChange={(newItems) => setTask({ ...task, items: newItems })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
