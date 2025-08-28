import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TaskListDTO, TodoDTO } from "./types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerNoChevron,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Edit,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clipboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
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

interface TaskCardProps {
  task: TaskListDTO;
  isSelected?: boolean;
  onSelectionChange?: (isSelected: boolean) => void;
  onDelete?: () => void;
  onTodoChange?: (taskId: string, updatedTodos: TodoDTO[]) => void;
}

export function TaskCard({
  task,
  isSelected = false,
  onSelectionChange,
  onDelete,
  onTodoChange,
}: TaskCardProps) {
  const router = useRouter();
  const [localTodos, setLocalTodos] = useState<TodoDTO[]>(task.todos);
  const [loadingTodoIds, setLoadingTodoIds] = useState<Set<string>>(new Set());
  const [showSchemaErrorModal, setShowSchemaErrorModal] = useState(false);

  const handleTodoToggle = async (todoId: string) => {
    // Find the todo
    const todo = localTodos.find((t) => t.id === todoId);
    if (!todo) return;

    // Update local state immediately (optimistic update)
    const updatedTodos = localTodos.map((t) =>
      t.id === todoId ? { ...t, checked: !t.checked } : t
    );

    setLocalTodos(updatedTodos);

    // Notify parent component about the change
    if (onTodoChange) {
      onTodoChange(task.id, updatedTodos);
    }

    // Mark todo as loading
    setLoadingTodoIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(todoId);
      return newSet;
    });

    try {
      // Send the API request
      await api.patch(
        `/api/v1/tasks/todo/${todoId}/check?checked=${!todo.checked}`
      );

      // Success - nothing else to do, state is already updated
    } catch (error) {
      // Error - roll back the change
      const rollbackTodos = localTodos.map((t) =>
        t.id === todoId ? { ...t } : t
      );

      setLocalTodos(rollbackTodos);

      // Notify parent of the rollback
      if (onTodoChange) {
        onTodoChange(task.id, rollbackTodos);
      }

      // Show error toast
      toast("Failed to update todo", {
        description: "The task could not be updated. Please try again.",
      });
    } finally {
      // Remove loading state
      setLoadingTodoIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(todoId);
        return newSet;
      });
    }
  };

  const handleExportNotion = async () => {
    toast("Exporting...", {
      description: "We are exporting your task list to Notion.",
    });
    try {
      await api.post(`/api/v1/notion/taskList/${task.id}`);
      toast("Notion page created!", {
        description: `Created a checklist for “${task.title}”.`,
      });
    } catch (e: any) {
      if (e.message.includes("invalid schema")) {
        setShowSchemaErrorModal(true);
      } else {
        toast("Failed to create Notion page", {
          description: e.message,
        });
      }
    } finally {
    }
  };

  const handleCopyToClipboard = async () => {
    if (!task?.todos || task.todos.length === 0) return;
    try {
      // 1. Format the todos into a clean, readable string.
      const formattedTodos = task.todos
        .map((todo) => {
          // Set the checkbox symbol based on the 'checked' status.
          const checkbox = todo.checked ? "✅" : "⬜️";

          // Format the optional deadline.
          const deadlineText = todo.deadline
            ? ` | Due: ${new Date(todo.deadline).toLocaleDateString()}`
            : "";

          return `${checkbox} ${todo.content}${deadlineText}`;
        })
        .join("\n"); // Join each todo item with a new line.

      // 2. Combine the title, description, and todos into the final text.
      const clipboardText = `${task.title}\n${task.description}\n\n${formattedTodos}`;

      // 3. Use the modern Clipboard API to copy the text.
      await navigator.clipboard.writeText(clipboardText);

      toast("Items copied to clipboard!");
    } catch (err: any) {
      toast("Failed to copy", {
        description: "Could not copy items to clipboard.",
      });
    } finally {
      // Add a small delay to show the checkmark
    }
  };

  const isPastDeadline = (deadline?: string): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleEdit = () => {
    router.push(`/app/tasks/edit/${task.id}`);
  };

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this task?"
      );
      if (!confirmed) return;

      await api.delete(`/api/v1/tasks/${task.id}`);

      // Notify parent to refresh the list
      if (onDelete) onDelete();
    } catch (error) {
      toast("Failed to delete task", {
        description: "The task could not be deleted. Please try again.",
      });
    }
  };

  // Check if there are any overdue todos
  const hasOverdueTodos = localTodos.some(
    (todo) => !todo.checked && isPastDeadline(todo.deadline)
  );

  // Check if all todos are completed
  const isTaskCompleted =
    localTodos.length > 0 && localTodos.every((todo) => todo.checked);

  // Check if task is in progress (some todos checked, some not)
  const isInProgress =
    localTodos.length > 0 &&
    localTodos.some((todo) => todo.checked) &&
    !isTaskCompleted;

  // Get the task status badge
  const getTaskStatusBadge = () => {
    // Priority order: Overdue > Completed > In Progress
    if (hasOverdueTodos) {
      return (
        <Badge
          variant="destructive"
          className="flex items-center md:gap-1 text-xs"
        >
          <Clock className="h-3 w-3" />
          <span className="hidden md:inline-block">Overdue</span>
        </Badge>
      );
    }

    if (isTaskCompleted) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700 flex items-center md:gap-1 text-xs"
        >
          <CheckCircle2 className="h-3 w-3" />
          <span className="hidden md:inline-block">Completed</span>
        </Badge>
      );
    }

    if (isInProgress && localTodos.length > 0) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700 flex items-center md:gap-1 text-xs"
        >
          <AlertCircle className="h-3 w-3" />
          <span className="hidden md:inline-block">In Progress</span>
        </Badge>
      );
    }

    return null;
  };

  return (
    <>
      <AccordionItem
        value={task.id}
        className="border rounded-lg overflow-hidden w-full group"
      >
        <div className="flex items-center justify-between w-full gap-x-4 px-4">
          <div className="flex flex-1 items-baseline gap-x-4 ">
            {onSelectionChange && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectionChange}
                className={cn(
                  "flex-shrink-0 cursor-pointer relative translate-y-0.5",
                  task.description && "translate-y-1"
                )}
              />
            )}
            <AccordionTriggerNoChevron className="flex-1 hover:no-underline py-4 cursor-pointer rounded-md">
              <div className="flex flex-col items-start text-left w-full">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm md:text-lg">
                    {task.title}
                  </div>
                  <div>
                    {/* Single status badge based on priority */}
                    {getTaskStatusBadge()}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 group-data-[state=open]:line-clamp-none">
                  {task.description}
                </p>
              </div>
            </AccordionTriggerNoChevron>
          </div>
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportNotion}>
                  <Image
                    src="/icons/notion-logo.svg"
                    alt="Notion Logo"
                    width={16}
                    height={16}
                  />{" "}
                  Export to Notion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                  Copy list
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <AccordionContent>
          <CardContent className="pt-2 pb-4 px-4">
            <hr />
            <div className="space-y-2 mt-2">
              {localTodos.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No todo items in this task.
                </p>
              ) : (
                localTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-baseline gap-2 p-2 rounded-md ${
                      isPastDeadline(todo.deadline) && !todo.checked
                        ? "bg-red-100 dark:bg-red-900/30"
                        : ""
                    }`}
                  >
                    <Checkbox
                      checked={todo.checked}
                      onCheckedChange={() => handleTodoToggle(todo.id)}
                      disabled={loadingTodoIds.has(todo.id)}
                      id={`todo-${todo.id}`}
                      className="relative translate-y-0.5 size-3.5"
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`flex-grow ${
                        todo.checked ? "line-through text-muted-foreground" : ""
                      } ${loadingTodoIds.has(todo.id) ? "opacity-50" : ""}`}
                    >
                      {todo.content}
                    </label>
                    {todo.deadline && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(todo.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
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
