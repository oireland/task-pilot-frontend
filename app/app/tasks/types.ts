// app/app/tasks/types.ts

// Describes a single todo item
export interface TodoDTO {
  id: string;
  content: string;
  checked: boolean;
  deadline?: string; // optional deadline as ISO string
}

// Describes a single task document
export interface TaskListDTO {
  id: string;
  title: string;
  description: string;
  todos: TodoDTO[];
  createdAt: string;
  updatedAt: string;
}

// Describes the paginated API response
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Current page number (0-indexed)
}

// Request interface for updating todos
export interface UpdateTodosRequest {
  taskId: string;
  todos: TodoDTO[];
}
