"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoDTO } from "@/app/app/tasks/types";
import { DateTimePicker } from "@/components/date-time-picker";
import { memo, useCallback, useState, useEffect } from "react";

type Props = {
  todos: TodoDTO[];
  onChange?: (todos: TodoDTO[]) => void;
  editable?: boolean;
};

// Individual todo content component to prevent full re-renders when typing
const TodoContent = memo(
  ({
    content,
    onChange,
  }: {
    content: string;
    onChange: (value: string) => void;
  }) => {
    const [localContent, setLocalContent] = useState(content);

    useEffect(() => {
      setLocalContent(content);
    }, [content]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalContent(newValue);
    };

    const handleBlur = () => {
      if (localContent !== content) {
        onChange(localContent);
      }
    };

    return (
      <Textarea
        value={localContent}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Todo item"
        className="flex-1 text-sm md:text-base min-h-[60px] resize-none"
      />
    );
  }
);

TodoContent.displayName = "TodoContent";

// Create a memoized todo item component to prevent unnecessary re-renders
const TodoItem = memo(
  ({
    todo,
    index,
    onContentChange,
    onCheckedChange,
    onRemove,
    onDeadlineChange,
  }: {
    todo: TodoDTO;
    index: number;
    onContentChange: (index: number, content: string) => void;
    onCheckedChange: (index: number, checked: boolean) => void;
    onRemove: (index: number) => void;
    onDeadlineChange: (index: number, date: Date | undefined) => void;
  }) => {
    const handleContentChange = useCallback(
      (value: string) => {
        onContentChange(index, value);
      },
      [index, onContentChange]
    );

    return (
      <div className="flex flex-col border rounded-md overflow-hidden">
        {/* Todo item row */}
        <div className="flex flex-row items-start gap-2 p-3 border-b">
          <Checkbox
            checked={todo.checked || false}
            onCheckedChange={(checked) =>
              onCheckedChange(index, checked === true)
            }
            className="flex-shrink-0 mt-2"
          />
          <TodoContent
            content={todo.content || ""}
            onChange={handleContentChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Date picker */}
        <div className="p-3">
          <DateTimePicker
            date={todo.deadline ? new Date(todo.deadline) : undefined}
            setDate={(date) => onDeadlineChange(index, date)}
          />
        </div>
      </div>
    );
  }
);

TodoItem.displayName = "TodoItem";

export function TaskList({ todos = [], onChange, editable = true }: Props) {
  // Use a local copy of todos to avoid re-renders when parent state changes
  const [localTodos, setLocalTodos] = useState<TodoDTO[]>(todos);

  // Update local todos when props change
  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

  // Batch updates to reduce re-renders
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Batch updates to parent component
  const batchUpdate = useCallback(
    (newTodos: TodoDTO[]) => {
      setLocalTodos(newTodos);

      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      if (onChange) {
        const timeout = setTimeout(() => {
          onChange(newTodos);
        }, 300); // Debounce updates to parent
        setUpdateTimeout(timeout);
      }
    },
    [onChange, updateTimeout]
  );

  // Memoize callback functions to prevent re-creation on every render
  const updateTodoContent = useCallback(
    (index: number, content: string) => {
      try {
        const updated = [...localTodos];
        if (!updated[index]) return;
        updated[index] = { ...updated[index], content };
        batchUpdate(updated);
      } catch (error) {
        console.error("Error updating todo content:", error);
      }
    },
    [localTodos, batchUpdate]
  );

  const updateTodoChecked = useCallback(
    (index: number, checked: boolean) => {
      try {
        const updated = [...localTodos];
        if (!updated[index]) return;
        updated[index] = { ...updated[index], checked };
        // Don't debounce checkbox changes
        setLocalTodos(updated);
        if (onChange) onChange(updated);
      } catch (error) {
        console.error("Error updating todo checked status:", error);
      }
    },
    [localTodos, onChange]
  );

  const updateTodoDeadline = useCallback(
    (index: number, deadline: Date | undefined) => {
      try {
        const updated = [...localTodos];
        if (!updated[index]) return;
        updated[index] = {
          ...updated[index],
          deadline: deadline ? deadline.toISOString() : undefined,
        };
        // Don't debounce date changes
        setLocalTodos(updated);
        if (onChange) onChange(updated);
      } catch (error) {
        console.error("Error updating todo deadline:", error);
      }
    },
    [localTodos, onChange]
  );

  const removeTodo = useCallback(
    (index: number) => {
      try {
        const updated = localTodos.filter((_, i) => i !== index);
        // Don't debounce removals
        setLocalTodos(updated);
        if (onChange) onChange(updated);
      } catch (error) {
        console.error("Error removing todo:", error);
      }
    },
    [localTodos, onChange]
  );

  const addTodo = useCallback(() => {
    try {
      const newTodo: TodoDTO = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: "",
        checked: false,
      };
      const updated = [...localTodos, newTodo];
      // Don't debounce additions
      setLocalTodos(updated);
      if (onChange) onChange(updated);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }, [localTodos, onChange]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  // If no todos are provided or it's not an array, initialize with an empty array
  const safeTodos = Array.isArray(localTodos) ? localTodos : [];

  if (!editable) {
    return (
      <div className="space-y-2">
        {safeTodos.length === 0 ? (
          <div className="text-sm text-gray-500">No tasks found.</div>
        ) : (
          safeTodos.map((todo, index) => (
            <div
              key={todo.id || index}
              className="flex items-baseline gap-2 p-2 rounded-md"
            >
              <Checkbox checked={todo.checked} disabled className="mt-0.5" />
              <div className="flex-1">
                <span
                  className={cn(
                    todo.checked ? "line-through text-muted-foreground" : ""
                  )}
                >
                  {todo.content}
                </span>
              </div>
              {todo.deadline && (
                <span className="text-xs text-muted-foreground">
                  {new Date(todo.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {safeTodos.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No tasks found. Add tasks below.
        </div>
      )}

      {safeTodos.map((todo, index) => (
        <TodoItem
          key={todo.id || index}
          todo={todo}
          index={index}
          onContentChange={updateTodoContent}
          onCheckedChange={updateTodoChecked}
          onRemove={removeTodo}
          onDeadlineChange={updateTodoDeadline}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addTodo}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Item
      </Button>
    </div>
  );
}
