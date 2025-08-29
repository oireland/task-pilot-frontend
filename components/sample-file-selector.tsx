"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export type SampleFileSelectorProps = {
  id?: string;
  label?: string; // heading above the box
  subtitle?: string; // subheading under the title
  placeholder?: string;
  acceptedText?: string;
  options?: Option[];
  groupLabel?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

/**
 * A shadcn/ui Select that uses a "disabled file dropzone"-style Trigger.
 * Clicking anywhere in the dashed box opens the Select menu (no real drag/drop).
 * Follows shadcn's Input/Label composition for accessibility. [^1]
 */
export function SampleFileSelector({
  id = "select-file-drop-trigger",
  label = "Upload document",
  subtitle = "PDF, DOCX, MD, or TXT",
  placeholder = "Drag & drop your file here, or browse",
  acceptedText = "Accepted: .pdf, .docx, .md, .txt",
  options = [
    { value: "resume.pdf", label: "Resume.pdf" },
    { value: "cover-letter.docx", label: "CoverLetter.docx" },
    { value: "notes.md", label: "notes.md" },
    { value: "readme.txt", label: "readme.txt" },
  ],
  groupLabel = "Recent files",
  value,
  defaultValue,
  onValueChange,
  className,
}: SampleFileSelectorProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue
  );
  const selected = value ?? internalValue;
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  function handleChange(v: string) {
    setInternalValue(v);
    onValueChange?.(v);
  }

  return (
    <section
      className={cn("w-full", className)}
      aria-labelledby={`${id}-title`}
    >
      <div className="space-y-1.5">
        <h2 id={`${id}-title`} className="text-2xl font-semibold leading-none">
          {label}
        </h2>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </div>

      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>

      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
      >
        {/* Make Trigger look like a disabled dropzone; hide default chevron. */}
        <SelectTrigger
          id={id}
          className={cn(
            "mt-4 w-full rounded-xl border-2 border-dashed border-muted-foreground/30 p-4 sm:p-6 md:p-10",
            "min-h-[140px] md:min-h-[180px] text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            "bg-background shadow-none",
            // Center content column and hide built-in chevron/icon
            "flex flex-col items-center justify-center gap-0  [&>svg]:hidden"
          )}
        >
          <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-emerald-50">
            <Upload
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-700"
              aria-hidden
            />
          </span>

          <div className="mt-3 md:mt-6 space-y-1 sm:space-y-2">
            {selectedLabel ? (
              <p className="text-sm sm:text-base md:text-lg text-foreground">
                Selected: <span className="font-medium">{selectedLabel}</span>
              </p>
            ) : (
              <p className="text-sm sm:text-base md:text-lg text-foreground">
                {"Drag & drop file, or "}
                <span className="text-emerald-700 underline underline-offset-4">
                  browse
                </span>
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              {acceptedText}
            </p>
          </div>
        </SelectTrigger>

        <SelectContent className="w-(--radix-select-trigger-width)">
          <SelectGroup>
            {groupLabel ? <SelectLabel>{groupLabel}</SelectLabel> : null}
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </section>
  );
}
