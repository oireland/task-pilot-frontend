"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { TaskListDTO, TodoDTO } from "@/app/app/tasks/types";
import { api } from "@/lib/api";
import { DateTimePicker } from "@/components/date-time-picker";

interface TaskEditorProps {
  taskId?: string; // Optional - if provided, will fetch existing task data
  initialData?: {
    title: string;
    description: string;
    todos: TodoDTO[];
  }; // For AI page to pass extracted data
  onSubmit: (taskData: {
    title: string;
    description: string;
    todos: TodoDTO[];
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string; // "Create Task", "Save Changes", etc.
  isSubmitting?: boolean; // For external loading state
  cardTitle?: string; // "Create New Task", "Edit Task", etc.
}

interface LocalTodoItem {
  id?: string;
  content: string;
  checked: boolean;
  deadline?: Date | string;
}

export function TaskEditor({
  taskId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting = false,
  cardTitle = "Task Editor",
}: TaskEditorProps) {
  const [loading, setLoading] = useState(!!taskId); // Only load if we need to fetch data
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [showScrollDownIndicator, setShowScrollDownIndicator] = useState(false);
  const [showScrollUpIndicator, setShowScrollUpIndicator] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [todos, setTodos] = useState<LocalTodoItem[]>(() => {
    if (initialData?.todos?.length) {
      return initialData.todos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : undefined,
      }));
    }
    return [{ content: "", checked: false }];
  });

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollIndicators = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - 10;
        const isAtTop = scrollTop <= 10;

        setShowScrollDownIndicator(isScrollable && !isAtBottom);
        setShowScrollUpIndicator(isScrollable && !isAtTop);
      }
    };

    checkScrollIndicators();

    const observer = new ResizeObserver(checkScrollIndicators);
    if (contentRef.current) {
      observer.observe(contentRef.current);
      contentRef.current.addEventListener("scroll", checkScrollIndicators);
    }

    window.addEventListener("resize", checkScrollIndicators);

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", checkScrollIndicators);
      }
      observer.disconnect();
      window.removeEventListener("resize", checkScrollIndicators);
    };
  }, [todos, loading]);

  // Fetch existing task data if taskId is provided
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      try {
        setLoading(true);
        const taskList: TaskListDTO = await api.get(`/api/v1/tasks/${taskId}`);

        setTitle(taskList.title);
        setDescription(taskList.description);

        const formattedTodos = taskList.todos?.length
          ? taskList.todos.map((todo) => ({
              ...todo,
              deadline: todo.deadline ? new Date(todo.deadline) : undefined,
            }))
          : [{ content: "", checked: false }];

        setTodos(formattedTodos);
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Update state when initialData changes (for AI page)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);

      const formattedTodos = initialData.todos?.length
        ? initialData.todos.map((todo) => ({
            ...todo,
            deadline: todo.deadline ? new Date(todo.deadline) : undefined,
          }))
        : [{ content: "", checked: false }];

      setTodos(formattedTodos);
    }
  }, [initialData]);

  const addTodo = useCallback(() => {
    setTodos((prev) => [...prev, { content: "", checked: false }]);
  }, []);

  const removeTodo = useCallback((index: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateTodoContent = useCallback((index: number, content: string) => {
    setTodos((prev) => {
      const newTodos = [...prev];
      newTodos[index].content = content;
      return newTodos;
    });
  }, []);

  const updateTodoChecked = useCallback((index: number, checked: boolean) => {
    setTodos((prev) => {
      const newTodos = [...prev];
      newTodos[index].checked = checked;
      return newTodos;
    });
  }, []);

  const updateTodoDeadline = useCallback(
    (index: number, deadline: Date | undefined) => {
      setTodos((prev) => {
        const newTodos = [...prev];
        newTodos[index].deadline = deadline;
        return newTodos;
      });
    },
    []
  );

  // Scroll handlers
  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty todos
    const validTodos = todos.filter((todo) => todo.content.trim() !== "");

    // Convert Date objects to ISO strings and format for API
    const todosForApi: TodoDTO[] = validTodos.map((todo) => ({
      id: todo.id || "", // Provide empty string if no id (for new todos)
      content: todo.content,
      checked: todo.checked,
      deadline:
        todo.deadline instanceof Date
          ? todo.deadline.toISOString()
          : typeof todo.deadline === "string"
          ? todo.deadline
          : undefined,
    }));

    await onSubmit({
      title,
      description,
      todos: todosForApi,
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 h-[calc(100vh-6rem)]">
        <Card className="flex flex-col h-full">
          <CardContent className="flex-grow flex items-center justify-center">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 h-[calc(100vh-6rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-xl font-semibold md:text-2xl">
            {cardTitle}
          </CardTitle>
        </CardHeader>

        {/* Scrollable content area with custom scrollbar */}
        <CardContent
          ref={contentRef}
          className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative"
        >
          <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block font-medium text-base md:text-lg"
              >
                Title
              </label>
              <Input
                id="title"
                className="text-sm md:text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block font-medium text-base md:text-lg"
              >
                Description
              </label>
              <Textarea
                id="description"
                className="text-sm md:text-base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block font-medium text-base md:text-lg">
                  To-Do Items
                </label>
                <Button
                  type="button"
                  onClick={addTodo}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {todos.map((todo, index) => (
                <div
                  key={index}
                  className="flex flex-col border rounded-md overflow-hidden"
                >
                  {/* Single responsive layout for both mobile and desktop */}
                  <div className="flex flex-row items-start gap-2 p-3 border-b">
                    <Checkbox
                      checked={todo.checked}
                      onCheckedChange={(checked) =>
                        updateTodoChecked(index, checked === true)
                      }
                      className="flex-shrink-0 mt-2"
                    />
                    <Textarea
                      value={todo.content}
                      onChange={(e) => updateTodoContent(index, e.target.value)}
                      placeholder="Todo item"
                      className="flex-1 text-sm md:text-base min-h-[60px] resize-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTodo(index)}
                      className="flex-shrink-0 mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Date picker */}
                  <div className="p-3">
                    <DateTimePicker
                      date={
                        todo.deadline instanceof Date
                          ? todo.deadline
                          : undefined
                      }
                      setDate={(date) => updateTodoDeadline(index, date)}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={addTodo}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
          </form>

          {/* Scroll indicators */}
          <div className="fixed left-8 bottom-12 md:left-auto md:right-8 md:bottom-24 flex flex-col gap-1 md:gap-2 pointer-events-auto">
            {showScrollUpIndicator && (
              <button
                onClick={scrollToTop}
                className="rounded-full p-2 bg-primary/10 hover:bg-primary/20 shadow-sm transition-colors"
                aria-label="Scroll to top"
              >
                <ChevronUp className="h-5 w-5 text-primary" />
              </button>
            )}
            {showScrollDownIndicator && (
              <button
                onClick={scrollToBottom}
                className="rounded-full p-2 bg-primary/10 hover:bg-primary/20 shadow-sm transition-colors"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="h-5 w-5 text-primary" />
              </button>
            )}
          </div>
        </CardContent>

        {/* Fixed footer */}
        <CardFooter className="flex-shrink-0 border-t mt-auto">
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="task-form" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
