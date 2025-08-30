"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  clearable?: boolean;
  className?: string;
  defaultTime?: string; // Format: "HH:mm", defaults to "00:00" if not provided
}

export function DateTimePicker({
  date,
  setDate,
  clearable = true,
  className,
  defaultTime = "00:00",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Disable scrolling when popover is open
  React.useEffect(() => {
    if (isOpen) {
      // Store original overflow values
      const originalOverflow = document.body.style.overflow;

      // Disable scrolling
      document.body.style.overflow = "hidden";

      // Handle keyboard events
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        // Restore original values when popover closes
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) {
      setDate(undefined);
      return;
    }

    const newDateTime = new Date(selected);

    if (date) {
      // If we already have a date with time, preserve the existing time
      newDateTime.setHours(date.getHours());
      newDateTime.setMinutes(date.getMinutes());
    } else {
      // If no existing date, use the default time
      const [hours, minutes] = defaultTime.split(":").map(Number);
      newDateTime.setHours(hours);
      newDateTime.setMinutes(minutes);
    }

    setDate(newDateTime);
  };

  const handleTimeChange = (timeString: string) => {
    if (!date) {
      // If no date is selected, create a new date with today's date and the selected time
      const newDateTime = new Date();
      const [hours, minutes] = timeString.split(":").map(Number);
      newDateTime.setHours(hours);
      newDateTime.setMinutes(minutes);
      newDateTime.setSeconds(0);
      newDateTime.setMilliseconds(0);

      setDate(newDateTime);
      return;
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    newDateTime.setSeconds(0);
    newDateTime.setMilliseconds(0);

    setDate(newDateTime);
  };

  const handleDone = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setDate(undefined);
    setIsOpen(false);
  };

  // Generate time options in 30-minute increments
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  }, []);

  const selectedTime = date
    ? `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    : defaultTime; // Show default time when no date is selected

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date & time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        collisionPadding={20}
        sideOffset={8}
        avoidCollisions={true}
      >
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
        <div className="p-3 border-t border-border">
          <Select value={selectedTime} onValueChange={handleTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              collisionPadding={20}
              className="max-h-[200px] overflow-y-auto"
            >
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleDone}
            className="flex-1"
          >
            Done
          </Button>
          {clearable && date && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
