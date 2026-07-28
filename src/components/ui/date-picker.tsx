"use client";

import { format } from "date-fns";
import { fr as dateFnsFr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { fr as dayPickerFr } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  "aria-invalid"?: boolean;
  className?: string;
  date?: Date;
  disabled?: boolean;
  disabledDates?: Date[];
  id?: string;
  maxDate?: Date;
  minDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Choisir une date",
  className,
  id,
  "aria-invalid": ariaInvalid,
  disabled,
  disabledDates,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const unavailableDates = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
    ...(disabledDates ?? []),
  ];

  const selectDate = useCallback(
    (nextDate: Date | undefined) => {
      onDateChange?.(nextDate);
      if (nextDate) {
        setOpen(false);
      }
    },
    [onDateChange]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
            data-empty={!date}
            disabled={disabled}
            id={id}
            type="button"
            variant="outline"
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {date ? (
          format(date, "PPP", { locale: dateFnsFr })
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="maison-madras-overlay w-auto p-0"
      >
        <Calendar
          autoFocus
          className="[--cell-size:--spacing(9)]"
          defaultMonth={date ?? minDate}
          disabled={unavailableDates}
          endMonth={maxDate}
          locale={dayPickerFr}
          mode="single"
          onSelect={selectDate}
          selected={date}
          showOutsideDays={false}
          startMonth={minDate}
        />
      </PopoverContent>
    </Popover>
  );
}
