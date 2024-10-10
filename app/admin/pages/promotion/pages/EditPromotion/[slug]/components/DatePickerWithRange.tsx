import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { th } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (date: DateRange | undefined) => void; // Callback for date change
  dateRange?: { from: Date | undefined; to: Date | undefined }; // New prop for initial date range
}

export function DatePickerWithRange({
  className,
  onDateChange,
  dateRange,
}: DatePickerWithRangeProps) {
  // Initialize the date state using the dateRange prop if provided
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange);

  // Update date state when dateRange prop changes
  React.useEffect(() => {
    setDate(dateRange);
  }, [dateRange]);

  const handleDateChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    console.log("Selected Date Range:", selectedDate);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  // Function to format the date with Buddhist Era year (BE)
  const formatWithBuddhistYear = (date: Date | undefined) => {
    if (!date) return "";
    const buddhistYear = date.getFullYear() + 543; // Add 543 to convert to BE
    return format(date, `dd LLL '${buddhistYear}'`, { locale: th });
  };

  const today = new Date(); // Get the current date

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full h-[3rem] justify-start text-left font-normal rounded-xl",
              !date && "text-muted-foreground font-DB_Med"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatWithBuddhistYear(date.from)} -{" "}
                  {formatWithBuddhistYear(date.to)}
                </>
              ) : (
                formatWithBuddhistYear(date.from)
              )
            ) : (
              <span className="font-DB_Med">เลือกวันที่</span> // Thai text for "Select Date"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-wrap">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from} // Set the initial month to the start date
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={1}
              className="mr-4"
              locale={th}
              fromDate={today} // Set the minimum selectable date to today
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
