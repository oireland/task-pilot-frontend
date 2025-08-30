"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { TaskEditor } from "@/components/task-editor";
import { TodoDTO } from "../../types";

export default function EditTaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (taskData: {
    title: string;
    description: string;
    todos: TodoDTO[];
  }) => {
    setIsSaving(true);

    try {
      await api.put(`/api/v1/tasks/${taskId}`, taskData);
      router.push("/app/tasks");
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TaskEditor
      taskId={taskId}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Save Changes"
      isSubmitting={isSaving}
      cardTitle="Edit Task"
    />
  );
}
