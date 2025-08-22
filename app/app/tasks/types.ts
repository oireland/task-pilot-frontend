// app/app/tasks/types.ts

// Describes a single task document
export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  items: string[];
  createdAt: string;
}

// Describes the paginated API response
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Current page number (0-indexed)
}
