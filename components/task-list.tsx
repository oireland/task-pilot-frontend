"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Plus, X } from 'lucide-react'

type Props = {
  tasks: string[]
  onChange?: (tasks: string[]) => void
  editable?: boolean
}

export function TaskList({ tasks, onChange, editable = true }: Props) {
  const handleUpdate = (index: number, value: string) => {
    if (!onChange) return
    const updated = [...tasks]
    updated[index] = value
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    if (!onChange) return
    const updated = tasks.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleAdd = () => {
    if (!onChange) return
    onChange([...tasks, ""])
  }

  if (!editable) {
    return (
      <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
        {tasks.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 && (
        <div className="text-sm text-gray-500">No tasks found. Add tasks below.</div>
      )}
      {tasks.map((t, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 rounded-md border p-2",
            "bg-white"
          )}
        >
          <Input
            value={t}
            onChange={(e) => handleUpdate(i, e.target.value)}
            placeholder={`Task ${i + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(i)}
            aria-label={`Remove task ${i + 1}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="gap-2" onClick={handleAdd}>
        <Plus className="h-4 w-4" />
        Add task
      </Button>
    </div>
  )
}
