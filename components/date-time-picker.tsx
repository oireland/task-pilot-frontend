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
}

export function DateTimePicker({
  date,
  setDate,
  clearable = true,
  className,
}: DateTimePickerProps) {
  // Remove unnecessary state and just use the props directly
  // This prevents the infinite update loop

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) {
      setDate(undefined);
      return;
    }

    const currentDateTime = date || new Date();
    const newDateTime = new Date(selected);

    // Preserve the time from the current selection
    newDateTime.setHours(currentDateTime.getHours());
    newDateTime.setMinutes(currentDateTime.getMinutes());

    setDate(newDateTime);
  };

  const handleTimeChange = (timeString: string) => {
    if (!date) {
      const newDateTime = new Date();

      const [hours, minutes] = timeString.split(":").map(Number);
      newDateTime.setHours(hours);
      newDateTime.setMinutes(minutes);

      setDate(newDateTime);
      return;
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);

    setDate(newDateTime);
  };

  const handleClear = () => {
    setDate(undefined);
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
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
        <div className="p-3 border-t border-border">
          <Select value={selectedTime} onValueChange={handleTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent position="popper">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {clearable && date && (
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
