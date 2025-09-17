"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, CalendarPlusIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Control, FieldValues, Path, useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Matcher } from "react-day-picker";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

interface DatePickerFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  tooltip?: string | React.ReactNode;
  dateFormat?: string;
  disabled?: boolean;
  disabledRange?: Matcher | Matcher[];
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  onChange?: (date: Date | undefined) => void;
}

export function DatePickerFormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecciona una fecha",
  description,
  tooltip,
  dateFormat = "yyyy-MM-dd",
  disabled = false,
  disabledRange,
  captionLayout = "label",
  onChange,
}: DatePickerFormFieldProps<T>) {
  const isMobile = useIsMobile();
  const { field, fieldState } = useController({ control, name });

  const parsedDate = useMemo(() => {
    if ((field.value as unknown) instanceof Date) return field.value;
    if (typeof field.value === "string") {
      const d = parseISO(field.value);
      return isValid(d) ? d : undefined;
    }
    return undefined;
  }, [field.value]);

  const [visibleMonth, setVisibleMonth] = useState<Date | undefined>(
    parsedDate
  );

  useEffect(() => {
    if (parsedDate && isValid(parsedDate)) {
      setVisibleMonth(parsedDate);
    }
  }, [parsedDate]);

  const displayValue = parsedDate
    ? format(parsedDate, dateFormat)
    : placeholder;

  const handleChange = (date: Date | undefined) => {
    if (date) {
      field.onChange(format(date, "yyyy-MM-dd"));
      if (isMobile) setDrawerOpen(false);
    } else {
      field.onChange("");
    }
    onChange?.(date);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <FormItem className="flex flex-col">
      {label && (
        <FormLabel className="flex justify-start items-center">
          {label}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="default"
                  className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                >
                  ?
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </FormLabel>
      )}

      {description && <FormDescription>{description}</FormDescription>}
      {isMobile ? (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <FormControl>
              <Button
                variant="input"
                className="w-full justify-between font-normal"
                disabled={disabled}
              >
                {displayValue}
                <CalendarPlusIcon />
              </Button>
            </FormControl>
          </DrawerTrigger>
          <DrawerContent className="w-auto p-0 overflow-hidden">
            <DrawerHeader>
              <DrawerTitle>Selecciona una fecha</DrawerTitle>
            </DrawerHeader>
            <Calendar
              mode="single"
              locale={es}
              selected={parsedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              captionLayout={captionLayout}
              onSelect={handleChange}
              disabled={disabled}
              className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="input"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !parsedDate && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                {displayValue}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={es}
              selected={parsedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              captionLayout={captionLayout}
              onSelect={handleChange}
              disabled={disabledRange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}
