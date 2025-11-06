/**
 * MultiSelect Component
 *
 * Reusable multi-select dropdown using Popover + Checkbox
 * Used for filtering projects by multiple criteria
 */

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MultiSelectOption<T = string> {
  value: T;
  label: string;
  section?: string; // Optional section header (e.g., "Intake (NA only)")
}

interface MultiSelectProps<T = string> {
  /**
   * Label for the select button
   */
  label: string;

  /**
   * Available options
   */
  options: MultiSelectOption<T>[];

  /**
   * Selected values
   */
  value: T[];

  /**
   * Callback when selection changes
   */
  onChange: (value: T[]) => void;

  /**
   * Placeholder when nothing selected
   */
  placeholder?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function MultiSelect<T = string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const handleToggle = (optionValue: T) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('h-10 justify-between', className)}
        >
          <span className="truncate">
            {value.length === 0
              ? placeholder
              : selectedLabels.length === 1
              ? selectedLabels[0]
              : selectedLabels.length === 2
              ? selectedLabels.join(', ')
              : `${selectedLabels[0]} +${selectedLabels.length - 1} more`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <div className="p-2">
          <div className="text-sm font-medium mb-2 px-2">{label}</div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {options.map((option, index) => {
              // Check if this option starts a new section
              const prevOption = index > 0 ? options[index - 1] : null;
              const showSectionHeader = option.section && option.section !== prevOption?.section;
              const showSeparator = showSectionHeader && index > 0;

              return (
                <div key={String(option.value)}>
                  {/* Section separator */}
                  {showSeparator && (
                    <div className="my-2 border-t border-border" />
                  )}

                  {/* Section header */}
                  {showSectionHeader && (
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      {option.section}
                    </div>
                  )}

                  {/* Option item */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox
                      checked={value.includes(option.value)}
                      onCheckedChange={() => handleToggle(option.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm">{option.label}</span>
                    {value.includes(option.value) && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clear all button */}
          {value.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
