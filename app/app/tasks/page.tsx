"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import type { Page, TaskListDTO, TodoDTO } from "./types";
import { TaskCard } from "./task-card";
import { DeleteConfirmationDialog } from "./delete-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import {
  Loader2,
  Search,
  FileQuestion,
  Trash2,
  Plus,
  Sparkle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TasksPage() {
  const router = useRouter();
  const [data, setData] = useState<Page<TaskListDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("createdAt,desc");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        sort,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const response = await api.get(`/api/v1/tasks?${params.toString()}`);
      setData(response as Page<TaskListDTO>);
    } catch (err: any) {
      setError("Failed to fetch tasks. Please try again later.");
      toast.error("Error", {
        description: err?.message ?? "Could not fetch tasks.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearchTerm, sort, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelectionChange = (taskId: string, isSelected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleTodoChange = (taskId: string, updatedTodos: TodoDTO[]) => {
    // Update data for UI consistency
    if (data) {
      setData({
        ...data,
        content: data.content.map((task) =>
          task.id === taskId ? { ...task, todos: updatedTodos } : task
        ),
      });
    }
  };

  const handleBatchDelete = async () => {
    const request = api.delete("/api/v1/tasks/batch", Array.from(selectedIds));
    toast.promise(request, {
      loading: "Deleting tasks...",
      success() {
        setSelectedIds(new Set());
        fetchTasks(); // Refresh the list
        return "Tasks deleted successfully";
      },
      error: "Failed to delete tasks",
      finally() {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const tasks = useMemo(() => data?.content ?? [], [data]);
  const hasSelection = selectedIds.size > 0;

  return (
    <>
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="block md:flex space-y-2 md:space-y-0 items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Your Tasks</h1>
            <p className="text-muted-foreground">
              View, search, and manage tasks extracted from your documents.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/app/tasks/create")}>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            <Button onClick={() => router.push("/app/ai")}>
              <Sparkle className="h-4 w-4" />
              Use AI
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt,desc">Newest First</SelectItem>
                <SelectItem value="createdAt,asc">Oldest First</SelectItem>
                <SelectItem value="updatedAt,desc">Recently Updated</SelectItem>
                <SelectItem value="updatedAt,asc">
                  Least Recently Updated
                </SelectItem>
                <SelectItem value="title,asc">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
            {hasSelection && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
              <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a document on the App page to get started!
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {tasks.map((taskDoc) => (
                <TaskCard
                  key={taskDoc.id}
                  task={taskDoc}
                  isSelected={selectedIds.has(taskDoc.id)}
                  onSelectionChange={(isSelected) =>
                    handleSelectionChange(taskDoc.id, isSelected)
                  }
                  onDelete={fetchTasks}
                  onTodoChange={handleTodoChange}
                />
              ))}
            </Accordion>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setPage((p) => Math.min(data.totalPages - 1, p + 1))
              }
              disabled={page >= data.totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleBatchDelete}
        itemCount={selectedIds.size}
      />
    </>
  );
}
