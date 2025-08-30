"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { TaskEditor } from "@/components/task-editor";
import { TodoDTO } from "../types";

export default function CreateTaskPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (taskData: {
    title: string;
    description: string;
    todos: TodoDTO[];
  }) => {
    setIsCreating(true);

    try {
      await api.post("/api/v1/tasks", taskData);
      router.push("/app/tasks");
      router.refresh();
    } catch (error) {
      console.error("Error creating task:", error);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TaskEditor
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Create Task"
      isSubmitting={isCreating}
      cardTitle="Create New Task"
    />
  );
}
