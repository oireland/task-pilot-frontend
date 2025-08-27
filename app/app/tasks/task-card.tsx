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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const { toast } = useToast();
  const [localTodos, setLocalTodos] = useState<TodoDTO[]>(task.todos);
  const [loadingTodoIds, setLoadingTodoIds] = useState<Set<string>>(new Set());

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
      toast({
        title: "Failed to update todo",
        description: "The task could not be updated. Please try again.",
        variant: "destructive",
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
      toast({
        title: "Failed to delete task",
        description: "The task could not be deleted. Please try again.",
        variant: "destructive",
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
              <div className="font-medium text-sm md:text-lg flex items-center gap-2 flex-wrap">
                {task.title}

                {/* Single status badge based on priority */}
                {getTaskStatusBadge()}
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
  );
}
