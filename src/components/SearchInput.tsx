import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputValue === value) return;

    debounceRef.current = setTimeout(() => {
      onChangeRef.current(inputValue);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, value]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Input
      className={cn("w-full h-9 text-sm", className)}
      variant="default"
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
}
