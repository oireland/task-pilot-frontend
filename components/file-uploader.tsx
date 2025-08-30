"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileText, Upload } from "lucide-react";

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string[]; // e.g., ['.pdf', '.docx']
};

export function FileUploader({ value, onChange, accept = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onChange(f);
    },
    [onChange]
  );

  const onBrowse = () => inputRef.current?.click();

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={onDrop}
      className={cn(
        "rounded-lg border border-dashed p-4 text-center",
        dragActive ? "border-primary bg-primary/5" : "border-gray-300"
      )}
      aria-label="Upload a document"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept.join(",")}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onChange(f);
        }}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-md bg-primary/10 p-2">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm ">
          Drag & drop your file here, or{" "}
          <button
            className="text-primary underline underline-offset-2"
            onClick={onBrowse}
            type="button"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Accepted: {accept.length ? accept.join(", ") : "Any"}
        </p>
      </div>

      {value && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[220px]">{value.name}</span>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
