"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { api } from "@/lib/api";
import { DateTimePicker } from "@/components/date-time-picker";

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showScrollDownIndicator, setShowScrollDownIndicator] = useState(false);
  const [showScrollUpIndicator, setShowScrollUpIndicator] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<
    Array<{
      content: string;
      checked: boolean;
      deadline?: Date;
    }>
  >([{ content: "", checked: false }]);

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollIndicators = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - 10;
        const isAtTop = scrollTop <= 10;

        // Only show down indicator if not at bottom and content is scrollable
        setShowScrollDownIndicator(isScrollable && !isAtBottom);

        // Only show up indicator if not at top and has been scrolled down
        setShowScrollUpIndicator(isScrollable && !isAtTop);
      }
    };

    checkScrollIndicators();

    // Re-check when todos change
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
  }, [todos]);

  const addTodo = () => {
    setTodos([...todos, { content: "", checked: false }]);
  };

  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const updateTodoContent = (index: number, content: string) => {
    const newTodos = [...todos];
    newTodos[index].content = content;
    setTodos(newTodos);
  };

  const updateTodoChecked = (index: number, checked: boolean) => {
    const newTodos = [...todos];
    newTodos[index].checked = checked;
    setTodos(newTodos);
  };

  const updateTodoDeadline = (index: number, deadline: Date | undefined) => {
    const newTodos = [...todos];
    newTodos[index].deadline = deadline;
    setTodos(newTodos);
  };

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
    setIsCreating(true);

    // Filter out empty todos
    const validTodos = todos.filter((todo) => todo.content.trim() !== "");

    // Convert Date objects to ISO strings for API
    const todosForApi = validTodos.map((todo) => ({
      ...todo,
      deadline: todo.deadline ? todo.deadline.toISOString() : undefined,
    }));

    try {
      await api.post("/api/v1/tasks", {
        title,
        description,
        todos: todosForApi,
      });

      router.push("/app/tasks");
      router.refresh();
    } catch (error) {
      console.error("Error creating task:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 h-[calc(100vh-6rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Create New Task</CardTitle>
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
                      date={todo.deadline}
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
          <div className="fixed left-8 bottom-15 md:left-auto md:right-8 md:bottom-24 flex flex-col gap-1 md:gap-2 pointer-events-auto">
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
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" form="task-form">
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
