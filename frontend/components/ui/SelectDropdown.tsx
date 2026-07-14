"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectDropdownProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  error?: string | string[];
  disabled?: boolean;
}

export function SelectDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
  buttonClassName,
  error,
  disabled = false,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const errorMessage = Array.isArray(error) ? error[0] : error;

  // Find the label of the currently selected option
  const selectedOption = options.find((opt) => opt.value.toString() === value.toString());
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || "Select...");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle select option
  const handleSelect = (val: string | number) => {
    onChange(val.toString());
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-zinc-200 bg-white pl-4 pr-10 py-2.5 text-sm outline-none transition-all text-left focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed select-none",
            errorMessage && "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
            buttonClassName
          )}
        >
          <span className="truncate text-zinc-900 dark:text-zinc-150">
            {displayLabel}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 dark:text-zinc-400">
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-150", isOpen && "transform rotate-180")} />
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-full max-h-36 overflow-y-auto overflow-x-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-[60] animate-in fade-in slide-in-from-top-1 duration-100 scrollbar-hide">
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full text-left rounded-md px-3 py-2 text-sm text-zinc-450 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-900 transition-colors truncate block"
              >
                {placeholder}
              </button>
            )}
            {options.map((opt) => {
              const isSelected = opt.value.toString() === value.toString();
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors truncate block disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent",
                    isSelected && "bg-indigo-50 text-indigo-650 hover:bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/40 font-semibold"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 font-medium mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
