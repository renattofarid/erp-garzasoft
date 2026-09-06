import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";
import { useState } from "react";

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  name: string;
  description?: string;
  label: string;
  placeholder?: string;
  options: Option[];
  control: Control<any>;
  onChange?: (value: string) => void;
}

export function FormSelect({
  name,
  description,
  label,
  placeholder,
  options,
  control,
  onChange,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find(
          (opt) => String(opt.value) === String(field.value)
        );
        
        return (
          <FormItem className="flex flex-col justify-start">
            <FormLabel>{label}</FormLabel>
            {description && (
              <FormDescription className="text-sm text-muted-foreground">
                {description}
              </FormDescription>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-9 px-3 py-2 font-normal border bg-background hover:bg-accent/50 shadow-2xs",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate text-left flex-1 min-w-0 mr-2 font-normal">
                      {selected ? selected.label : placeholder}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                  <CommandInput placeholder="Buscar..." />
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newValue =
                            option.value === field.value ? "" : option.value;
                          field.onChange(newValue);
                          setOpen(false);
                          onChange?.(String(newValue));
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(option.value) === String(field.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
